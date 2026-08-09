import {

  InspectionTasks,

} from '../../../data/master/inspectionTasks.mock';

class InspectionTaskApi {

  async getTasks() {

    return InspectionTasks;

  }

}

export default new InspectionTaskApi();