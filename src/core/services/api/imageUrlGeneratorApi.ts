/**
 * Mock Image URL Generator API.
 *
 * Real architecture:
 *
 * Upload API
 *     ↓
 * Image URL Generator
 *     ↓
 * Image URL
 *
 * For now this simply generates a fake URL.
 */

let imageCounter = 0;

class ImageUrlGeneratorApi {

  async generateUrl(
    imageUri: string,
  ): Promise<string> {

    await new Promise<void>(
      resolve =>
        setTimeout(resolve, 300),
    );

    imageCounter += 1;

    return `https://image${imageCounter}.png`;
  }
}

export default new ImageUrlGeneratorApi();