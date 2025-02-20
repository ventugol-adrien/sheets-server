import { dennemeyerJob, frankaRoboticsJob, openAIJob, shapeInJob } from "../assets/jobs.js";
const matchJob = {
    "3c7a8979-a7b6-492f-a636-825e203663c1": openAIJob,
    "7c01ff39-ed7a-4b4e-9c1f-54c13efa20ce": dennemeyerJob,
    "1c12803e-4353-4359-b4ff-f1ddb69e8e07": frankaRoboticsJob,
    "a35383f2-241d-4b13-9b2d-3af43550c45f": shapeInJob
};
export const getJob = (id) => {
    return matchJob[id]();
};
