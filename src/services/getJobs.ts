import { dennemeyerJob, frankaRoboticsJob, openAIJob } from "../assets/jobs"
import { Job } from "../types"

const matchJob : {[id:string]:()=>Job } = {
    "3c7a8979-a7b6-492f-a636-825e203663c1": openAIJob,
    "7c01ff39-ed7a-4b4e-9c1f-54c13efa20ce": dennemeyerJob,
    "1c12803e-4353-4359-b4ff-f1ddb69e8e07": frankaRoboticsJob

}

export const getJob = (id:string):Job | undefined => {
    return matchJob[id]()
}