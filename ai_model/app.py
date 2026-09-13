import os
import io
import torch
import torchvision.transforms as transforms
from PIL import Image, ImageStat
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
import requests

from train import CleanerInspectionCNN, CATEGORIES

app = FastAPI(title="Cleaner AI Vision Model Testing Suite")

# ---------------------------------------------------------------------------
# Model Initialization
# ---------------------------------------------------------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu")
model = CleanerInspectionCNN(num_categories=len(CATEGORIES), pretrained=False)

WEIGHTS_PATH = os.path.join(os.path.dirname(__file__), "cleaner_cnn.pt")
if os.path.exists(WEIGHTS_PATH):
    model.load_state_dict(torch.load(WEIGHTS_PATH, map_location=device, weights_only=True))
    model.to(device)
    model.eval()
    print(f"✅ Loaded trained custom CNN model from: {WEIGHTS_PATH}")
else:
    model.to(device)
    model.eval()
    print(f"⚠️ Notice: Trained weights ({WEIGHTS_PATH}) not found yet. Please run train.py first.")

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# ---------------------------------------------------------------------------
# Strict Hard-Negative & Solid Color / Blank Anomaly Gate
# ---------------------------------------------------------------------------
def evaluate_image_anomaly(img: Image.Image) -> tuple[bool, str]:
    """Inspects standard deviation across color channels and entropy to reject fake images."""
    stat = ImageStat.Stat(img)
    stddev = stat.stddev
    avg_std = sum(stddev) / len(stddev)
    mean_val = sum(stat.mean) / len(stat.mean)

    # Rejection 1: Low-entropy / Solid color
    if avg_std < 14.0:
        return True, "Solid / plain uniform color detected. Zero visual fixtures present."

    # Rejection 2: Pitch black / unlit screen
    if mean_val < 15.0:
        return True, "Image is completely dark / unlit."

    # Rejection 3: Plain overexposed white
    if mean_val > 245.0:
        return True, "Image is washed out / plain white screen."

    return False, ""

def compute_visual_cleanliness_heuristics(img: Image.Image) -> dict:
    """
    Computes computer vision color & contrast metrics (rust/stain discoloration,
    dirty water brown/yellow saturation, and dark grime accumulation) to dynamically adjust score.
    """
    # Convert to HSV to analyze color saturation & discoloration
    hsv_img = img.convert('HSV')
    h_stat = ImageStat.Stat(hsv_img)
    
    # Analyze RGB variance & floor/fixture staining
    img_rgb = img.convert('RGB')
    stat_rgb = ImageStat.Stat(img_rgb)
    r_mean, g_mean, b_mean = stat_rgb.mean
    
    # Brown/mud/rust stain detector: High Red + Low Blue in darker ranges
    stain_indicator = False
    if r_mean > (b_mean + 35) and (r_mean + g_mean + b_mean) < 450:
        stain_indicator = True
        
    return {
        "stain_indicator": stain_indicator,
        "mean_brightness": sum(stat_rgb.mean) / 3.0,
        "saturation_mean": h_stat.mean[1],
        "r_mean": r_mean,
        "g_mean": g_mean,
        "b_mean": b_mean,
    }


def correct_category_prediction(
    primary_detected: str,
    cat_probs: "np.ndarray",
    expected_item: str,
    heuristics: dict,
) -> tuple[str, str]:
    """
    Post-inference correction layer.

    The CNN sometimes mislabels:
      - Basin / mirror / shower scenes → 'urinal'  (urinal is narrow/wall-mounted; basins are wider)
      - General washroom wide-angle shots → 'urinal'

    We use two signals to override:
      1. The user-selected expected_item (ground truth intent).
      2. Visual color heuristics (brightness, color balance).

    Returns (corrected_category, correction_reason).
    """
    expected_lower = expected_item.lower()

    # Index lookup helpers
    cat_names = CATEGORIES  # ['washroom', 'basin', 'mirror', 'urinal', 'general']
    cat_idx = {c: i for i, c in enumerate(cat_names)}

    urinal_prob = float(cat_probs[cat_idx['urinal']])
    basin_prob = float(cat_probs[cat_idx['basin']])
    mirror_prob = float(cat_probs[cat_idx['mirror']])
    washroom_prob = float(cat_probs[cat_idx['washroom']])

    brightness = heuristics.get("mean_brightness", 128.0)

    # ── Rule 1: User selected mirror / basin / wash-basin ──────────────────────
    # If the model says urinal but the user explicitly chose mirror or basin,
    # the model is almost certainly wrong — urinals don't live above counters.
    if primary_detected == 'urinal' and expected_lower in (
        'mirror', 'basin', 'wash basin', 'wash-basin', 'soap', 'leak-free-taps'
    ):
        # Pick whichever non-urinal category has the highest probability
        alt_probs = {
            'mirror': mirror_prob,
            'basin': basin_prob,
            'washroom': washroom_prob,
        }
        corrected = max(alt_probs, key=lambda k: alt_probs[k])
        # If they're all near-zero, fall back to the expected item itself
        if alt_probs[corrected] < 0.08:
            corrected = expected_lower if expected_lower in cat_names else 'basin'
        return corrected, f"Category corrected from 'urinal' to '{corrected}' (selected item: {expected_item})"

    # ── Rule 2: Wide washroom shot mis-classified as urinal ────────────────────
    # Wide-angle bathroom scenes (toilet + sink visible) are rarely urinal-only.
    # Heuristic: brighter, bluer images with low red bias are more likely basin/washroom.
    if primary_detected == 'urinal' and expected_lower in (
        'washroom', 'flush', 'door-latch', 'running-water',
        'illumination', 'dustbin', 'janitor', 'standardised-signage'
    ):
        if washroom_prob >= 0.15 or basin_prob >= 0.10:
            corrected = 'washroom' if washroom_prob >= basin_prob else 'basin'
            return corrected, f"Category corrected from 'urinal' to '{corrected}' (wide-angle washroom scene detected)"
        # Bright, neutral-colored images are rarely urinals (urinals are close-up wall shots)
        if brightness > 100 and heuristics.get("r_mean", 0) < 160:
            return 'washroom', "Category corrected from 'urinal' to 'washroom' (scene brightness/color inconsistent with urinal close-up)"

    # ── Rule 3: Mirror scene should not be classified as urinal ───────────────
    # Mirror inspection items usually appear above basins — never urinals.
    if primary_detected == 'urinal' and expected_lower == 'mirror':
        corrected = 'mirror' if mirror_prob >= basin_prob else 'basin'
        return corrected, f"Category corrected from 'urinal' to '{corrected}' (mirror inspection item incompatible with urinal)"

    # No correction needed
    return primary_detected, ""

def run_model_inference(img: Image.Image, expected_item: str = "washroom") -> dict:  # noqa: C901
    # 1. Anomaly check (rejects solid colors, dark frames, fake shots)
    is_anomaly, reason = evaluate_image_anomaly(img)
    if is_anomaly:
        return {
            "inspectionItem": expected_item,
            "detectedCategory": "invalid_fake",
            "score": 0,
            "status": "FAIL",
            "validityScore": 0.0,
            "confidence": 0.99,
            "criteria": {
                "floorCleanliness": 0,
                "fixtureCleanliness": 0,
                "visibleStains": 0,
                "waste": 0,
                "overallHygiene": 0,
            },
            "issues": [f"Invalid Capture: {reason}"],
            "recommendations": ["Point camera directly at the actual washroom facility/fixture and recapture."],
            "isFake": True,
            "modelEngine": "custom-mobilenetv3-multi-task",
        }

    # 2. PyTorch Forward Pass (Multi-task evaluation across whole frame & localized crops)
    tensor = transform(img).unsqueeze(0).to(device)
    with torch.no_grad():
        out = model(tensor)
        is_valid_prob = float(out['is_valid'].item())
        cat_probs = torch.softmax(out['category_logits'], dim=-1).squeeze(0).cpu().numpy()
        pred_cat_idx = int(cat_probs.argmax())
        primary_detected = CATEGORIES[pred_cat_idx]
        category_confidence = float(cat_probs[pred_cat_idx])

        raw_score = float(out['score'].item()) * 100.0
        stains_prob = float(out['stains'].item())
        waste_prob = float(out['waste'].item())

    # Multi-Component Detection: Identify all present fixtures above confidence threshold
    detected_components = []
    category_scores_map = {}
    for idx, cat_name in enumerate(CATEGORIES):
        prob = float(cat_probs[idx])
        category_scores_map[cat_name] = round(prob, 3)
        # Lower threshold to 5% so minority-confidence fixtures (e.g. basin at 8%) still appear
        if prob >= 0.05 or cat_name == primary_detected:
            detected_components.append({
                "category": cat_name,
                "confidence": round(prob, 2),
            })

    # Sort components by confidence
    detected_components.sort(key=lambda x: x["confidence"], reverse=True)
    all_detected_names = [c["category"] for c in detected_components]

    # 3. Model Validity Gate (Model itself rejects non-washrooms)
    if is_valid_prob < 0.45:
        return {
            "inspectionItem": expected_item,
            "detectedCategory": primary_detected,
            "detectedComponents": detected_components,
            "score": 0,
            "status": "FAIL",
            "validityScore": round(is_valid_prob, 2),
            "confidence": round(1.0 - is_valid_prob, 2),
            "criteria": {
                "floorCleanliness": 0,
                "fixtureCleanliness": 0,
                "visibleStains": 0,
                "waste": 0,
                "overallHygiene": 0,
            },
            "issues": ["Image does not match Retail Outlet washroom patterns."],
            "recommendations": ["Ensure clear lighting and capture the inspection target clearly."],
            "isFake": True,
            "modelEngine": "custom-mobilenetv3-multi-task",
        }

    # 4. Computer vision heuristics for stains/grime
    heuristics = compute_visual_cleanliness_heuristics(img)
    if heuristics["stain_indicator"]:
        stains_prob = max(stains_prob, 0.88)
        raw_score = min(raw_score, 38.0)

    # 4b. Post-inference category correction — fix common mis-classifications
    corrected_category, correction_note = correct_category_prediction(
        primary_detected, cat_probs, expected_item, heuristics
    )
    if corrected_category != primary_detected:
        # Swap the primary detected category and update the components list
        primary_detected = corrected_category
        pred_cat_idx = CATEGORIES.index(corrected_category)
        category_confidence = float(cat_probs[pred_cat_idx])

        # Rebuild components with the corrected primary on top
        detected_components = [c for c in detected_components if c["category"] != corrected_category]
        detected_components.insert(0, {"category": corrected_category, "confidence": round(category_confidence, 2)})
        all_detected_names = [c["category"] for c in detected_components]

    # 5. Targeted Evaluation: Check if the user's expected item is present in this combined image
    expected_lower = expected_item.lower()
    category_match = True
    mismatch_warning = ""

    # Map every inspection task id → which CNN category labels are acceptable
    # Basin-area tasks: basin / leak-free-taps / soap all require a basin shot
    if expected_lower in ['basin', 'wash basin', 'wash-basin', 'soap', 'leak-free-taps']:
        target_group = ['basin', 'mirror']          # basin shot often shows mirror above it
    elif expected_lower == 'mirror':
        target_group = ['mirror', 'basin']           # mirrors live above basins
    elif expected_lower == 'urinal':
        target_group = ['urinal']
    # Wide-angle / whole-washroom tasks — any fixture is acceptable
    elif expected_lower in [
        'washroom', 'flush', 'door-latch', 'running-water', 'illumination',
        'dustbin', 'janitor', 'standardised-signage', 'exhaust-fans',
        'cleaning-in-progress-board', 'staff-safety-equipment', 'hygienic-condition',
    ]:
        target_group = ['washroom', 'basin', 'urinal', 'mirror', 'general']
    else:
        # Fallback: accept any category (unknown task ids)
        target_group = list(CATEGORIES)

    # Check if target is among detected multi-components or is a broad washroom view
    is_target_present = any(tg in all_detected_names for tg in target_group) or ('washroom' in all_detected_names)

    if not is_target_present:
        category_match = False
        mismatch_warning = f"Mismatch: Target fixture '{expected_item.title()}' was not detected in this photo. Found: {', '.join([c['category'].title() for c in detected_components])}."

    # 6. Compute Sub-Criteria Breakdown specifically for the targeted item
    final_score = int(min(100, max(15, round(raw_score))))
    has_stains = stains_prob > 0.50
    has_waste = waste_prob > 0.50

    issues = []
    recommendations = []

    if correction_note:
        # Log correction to server stdout for debugging
        print(f"[CategoryCorrection] {correction_note}")

    if mismatch_warning:
        issues.append(f"Target Item Warning: {mismatch_warning}")
        recommendations.append(f"Ensure the {expected_item.title()} fixture is clearly in frame.")

    # Note multi-component observation if more than 1 fixture is visible
    if len(detected_components) > 1 and is_target_present:
        comp_names = ", ".join([c["category"].title() for c in detected_components if c["category"] != "general"])
        issues.append(f"Wide frame observed: Multiple fixtures identified ({comp_names}). Graded for '{expected_item.title()}'.")

    if has_stains:
        issues.append("Visible rust, discoloration, or heavy stains observed on fixtures/floor.")
        recommendations.append("Apply heavy-duty sanitizing solution and descale surfaces.")
    if has_waste:
        issues.append("Unemptied litter or residue observed in inspection view.")
        recommendations.append("Clear trash receptacle and mop floor thoroughly.")
    if not has_stains and not has_waste and not mismatch_warning:
        issues.append("No critical defects observed.")
        recommendations.append("Continue standard cleaning schedule.")

    floor_cleanliness = max(0, min(100, final_score + (0 if not has_stains else -25)))
    fixture_cleanliness = max(0, min(100, final_score + (0 if not has_stains else -20)))
    visible_stains = max(0, min(100, 100 - int(stains_prob * 80)))
    waste = max(0, min(100, 100 - int(waste_prob * 70)))
    overall_hygiene = final_score if category_match else min(final_score, 45)
    status = "PASS" if (overall_hygiene >= 70 and category_match and not has_stains) else "FAIL"

    return {
        "inspectionItem": expected_item,
        "detectedCategory": primary_detected,
        "detectedComponents": detected_components,
        "categoryMatch": category_match,
        "categoryConfidence": round(category_confidence, 2),
        "categoryCorrection": correction_note if correction_note else None,
        "score": overall_hygiene,
        "status": status,
        "validityScore": round(is_valid_prob, 2),
        "confidence": round(is_valid_prob, 2),
        "criteria": {
            "floorCleanliness": floor_cleanliness,
            "fixtureCleanliness": fixture_cleanliness,
            "visibleStains": visible_stains,
            "waste": waste,
            "overallHygiene": overall_hygiene,
        },
        "issues": issues,
        "recommendations": recommendations,
        "isFake": False,
        "modelEngine": "custom-mobilenetv3-multi-task",
    }

# ---------------------------------------------------------------------------
# Web UI Dashboard for Real-Time Model Testing
# ---------------------------------------------------------------------------

@app.get("/", response_class=HTMLResponse)
def get_testing_dashboard():
    return """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cleaner AI — Custom CNN Model Testing Lab</title>
  <style>
    :root {
      --bg: #0f172a;
      --card: #1e293b;
      --border: #334155;
      --text: #f8fafc;
      --muted: #94a3b8;
      --primary: #38bdf8;
      --pass: #22c55e;
      --fail: #ef4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: var(--bg); color: var(--text); padding: 32px 16px; min-height: 100vh; }
    .container { max-width: 860px; margin: 0 auto; }
    header { text-align: center; margin-bottom: 28px; }
    h1 { font-size: 26px; font-weight: 700; margin-bottom: 8px; color: var(--primary); }
    p.subtitle { color: var(--muted); font-size: 14px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; }
    @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 20px; }
    .upload-zone {
      border: 2px dashed var(--border); border-radius: 12px; padding: 32px 16px; text-align: center;
      cursor: pointer; transition: 0.2s border-color; background: #0f172a55;
    }
    .upload-zone:hover { border-color: var(--primary); }
    input[type="file"] { display: none; }
    .preview-img { max-width: 100%; max-height: 240px; border-radius: 8px; margin-top: 14px; display: none; object-fit: contain; }
    button.btn {
      width: 100%; padding: 12px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer;
      border: none; background: var(--primary); color: #0f172a; margin-top: 16px; transition: opacity 0.2s;
    }
    button.btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .result-badge {
      display: inline-block; padding: 4px 12px; border-radius: 999px; font-weight: 700; font-size: 14px; margin-bottom: 12px;
    }
    .badge-pass { background: #22c55e22; color: var(--pass); border: 1px solid var(--pass); }
    .badge-fail { background: #ef444422; color: var(--fail); border: 1px solid var(--fail); }
    .score-circle {
      font-size: 44px; font-weight: 800; line-height: 1; margin-bottom: 4px;
    }
    .metric-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #33415566; font-size: 13px; }
    .metric-name { color: var(--muted); }
    .metric-val { font-weight: 600; }
    .tag-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .tag { background: #334155; padding: 4px 8px; border-radius: 6px; font-size: 12px; color: #cbd5e1; }
    .loading { display: none; text-align: center; padding: 20px; color: var(--primary); font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Cleaner AI — Custom CNN Lab</h1>
      <p class="subtitle">Upload any test photo (clean washroom, stained basin, or a solid color) to test the neural network live.</p>
    </header>

    <div class="grid">
      <!-- Upload Card -->
      <div class="card">
        <h2 style="font-size: 17px; margin-bottom: 14px;">1. Select Test Image</h2>
        <div class="upload-zone" onclick="document.getElementById('fileInput').click()">
          <div id="uploadPrompt">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" style="margin-bottom: 8px;">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
            <p style="font-size: 14px; font-weight: 500;">Click to upload image</p>
            <p style="font-size: 12px; color: var(--muted); margin-top: 4px;">JPEG or PNG format</p>
          </div>
          <img id="previewImg" class="preview-img" alt="Preview"/>
        </div>
        <input type="file" id="fileInput" accept="image/*" onchange="previewFile(event)"/>

        <div style="margin-top: 14px;">
          <label style="font-size: 13px; color: var(--muted); display: block; margin-bottom: 6px;">Inspection Item Type:</label>
          <select id="itemType" style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid var(--border); color: #fff; border-radius: 6px;">
            <option value="washroom">Washroom</option>
            <option value="basin">Wash Basin</option>
            <option value="mirror">Mirror</option>
            <option value="urinal">Urinal</option>
            <option value="dustbin">Dustbin</option>
            <option value="running-water">Running Water</option>
            <option value="flush">Flush Working</option>
            <option value="illumination">Adequate Illumination</option>
            <option value="door-latch">Functional Door Latch</option>
            <option value="leak-free-taps">Leak-Free Taps</option>
            <option value="exhaust-fans">Exhaust Fans</option>
            <option value="standardised-signage">Standardised Signage</option>
            <option value="soap">Soap Available</option>
            <option value="janitor">Janitor on Site</option>
            <option value="cleaning-in-progress-board">Cleaning in Progress Board</option>
            <option value="staff-safety-equipment">Staff Safety Equipment</option>
            <option value="hygienic-condition">Washroom Hygienic Condition</option>
          </select>
        </div>

        <button id="analyzeBtn" class="btn" onclick="submitImage()" disabled>Analyze Image</button>
      </div>

      <!-- Result Card -->
      <div class="card">
        <h2 style="font-size: 17px; margin-bottom: 14px;">2. AI Inference Output</h2>
        <div id="loading" class="loading">Evaluating image through CNN model...</div>
        
        <div id="results" style="display: none;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <span id="badge" class="result-badge"></span>
              <div id="scoreDisplay" class="score-circle"></div>
              <p style="font-size: 12px; color: var(--muted);">Overall Hygiene Score</p>
            </div>
            <div style="text-align: right;">
              <p style="font-size: 12px; color: var(--muted);">Detected Category</p>
              <p id="catDisplay" style="font-size: 15px; font-weight: 700; color: var(--primary);"></p>
              <p id="multiCompDisplay" style="font-size: 11px; color: #a5f3fc; margin-top: 3px;"></p>
            </div>
          </div>

          <div style="margin-top: 20px;">
            <p style="font-size: 13px; font-weight: 600; margin-bottom: 6px;">Sub-Criteria Breakdown</p>
            <div class="metric-row"><span class="metric-name">Floor Cleanliness</span><span id="mFloor" class="metric-val"></span></div>
            <div class="metric-row"><span class="metric-name">Fixture Cleanliness</span><span id="mFixture" class="metric-val"></span></div>
            <div class="metric-row"><span class="metric-name">Stain Resistance</span><span id="mStains" class="metric-val"></span></div>
            <div class="metric-row"><span class="metric-name">Waste Clearance</span><span id="mWaste" class="metric-val"></span></div>
            <div class="metric-row"><span class="metric-name">Real vs Fake Confidence</span><span id="mValid" class="metric-val"></span></div>
          </div>

          <div style="margin-top: 18px;">
            <p style="font-size: 13px; font-weight: 600;">Detected Issues / Anomaly:</p>
            <div id="issuesList" class="tag-list"></div>
          </div>

          <div style="margin-top: 14px;">
            <p style="font-size: 13px; font-weight: 600;">Recommendations:</p>
            <div id="recList" class="tag-list"></div>
          </div>
        </div>

        <div id="placeholder" style="text-align: center; color: var(--muted); padding: 48px 0; font-size: 14px;">
          Select an image and click <strong>Analyze Image</strong> to inspect real-time outputs.
        </div>
      </div>
    </div>
  </div>

  <script>
    let selectedFile = null;

    function previewFile(e) {
      const file = e.target.files[0];
      if (!file) return;
      selectedFile = file;
      const reader = new FileReader();
      reader.onload = function(evt) {
        const preview = document.getElementById('previewImg');
        preview.src = evt.target.result;
        preview.style.display = 'block';
        document.getElementById('uploadPrompt').style.display = 'none';
        document.getElementById('analyzeBtn').disabled = false;
      };
      reader.readAsDataURL(file);
    }

    async function submitImage() {
      if (!selectedFile) return;
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('inspectionItem', document.getElementById('itemType').value);

      document.getElementById('placeholder').style.display = 'none';
      document.getElementById('results').style.display = 'none';
      document.getElementById('loading').style.display = 'block';
      document.getElementById('analyzeBtn').disabled = true;

      try {
        const res = await fetch('/upload-analyze', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        renderResults(data);
      } catch (err) {
        alert('Analysis request failed: ' + err.message);
      } finally {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('analyzeBtn').disabled = false;
      }
    }

    function renderResults(d) {
      document.getElementById('results').style.display = 'block';

      const badge = document.getElementById('badge');
      badge.textContent = d.status;
      badge.className = 'result-badge ' + (d.status === 'PASS' ? 'badge-pass' : 'badge-fail');

      const scoreDisp = document.getElementById('scoreDisplay');
      scoreDisp.textContent = d.score + '/100';
      scoreDisp.style.color = d.status === 'PASS' ? 'var(--pass)' : 'var(--fail)';

      document.getElementById('catDisplay').textContent = (d.detectedCategory || 'N/A').toUpperCase();
      
      const compNames = (d.detectedComponents || [])
        .filter(c => c.category !== 'general')
        .map(c => `${c.category.toUpperCase()} (${Math.round(c.confidence * 100)}%)`)
        .join(', ');
      document.getElementById('multiCompDisplay').textContent = compNames ? `Detected: ${compNames}` : '';

      document.getElementById('mFloor').textContent = d.criteria.floorCleanliness + '/100';
      document.getElementById('mFixture').textContent = d.criteria.fixtureCleanliness + '/100';
      document.getElementById('mStains').textContent = d.criteria.visibleStains + '/100';
      document.getElementById('mWaste').textContent = d.criteria.waste + '/100';
      document.getElementById('mValid').textContent = Math.round((d.confidence || 0) * 100) + '%';

      const issuesDiv = document.getElementById('issuesList');
      issuesDiv.innerHTML = '';
      (d.issues || []).forEach(iss => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.textContent = iss;
        issuesDiv.appendChild(span);
      });

      const recDiv = document.getElementById('recList');
      recDiv.innerHTML = '';
      (d.recommendations || []).forEach(r => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.style.background = '#0284c733';
        span.style.color = '#38bdf8';
        span.textContent = r;
        recDiv.appendChild(span);
      });
    }
  </script>
</body>
</html>
"""

# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------

@app.post("/upload-analyze")
async def upload_and_analyze(file: UploadFile = File(...), inspectionItem: str = "washroom"):
    """Accepts multipart file upload from the browser UI or mobile app."""
    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        result = run_model_inference(img, inspectionItem)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class RemoteAnalyzeRequest(BaseModel):
    image_url: str
    inspection_item: str = "washroom"
    facility: str = "washroom"
    ro_id: str = "RO1001"

@app.post("/analyze")
async def analyze_from_url(req: RemoteAnalyzeRequest):
    """Accepts image URL (for Supabase Edge Function integration)."""
    try:
        resp = requests.get(req.image_url, timeout=15)
        if not resp.ok:
            raise HTTPException(status_code=400, detail="Failed to fetch image from URL")
        img = Image.open(io.BytesIO(resp.content)).convert("RGB")
        result = run_model_inference(img, req.inspection_item)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
