import { dennemeyerJob, frankaRoboticsJob, openAIJob, personioJob_1,personioJob_2, shapeInJob, ashbyJob } from "../assets/jobs"
import { Job } from "../types"

const matchJob : {[id:string]:()=>Job } = {
    "3c7a8979-a7b6-492f-a636-825e203663c1": openAIJob,
    "7c01ff39-ed7a-4b4e-9c1f-54c13efa20ce": dennemeyerJob,
    "1c12803e-4353-4359-b4ff-f1ddb69e8e07": frankaRoboticsJob,
    "a35383f2-241d-4b13-9b2d-3af43550c45f": shapeInJob,
    "b12fe041-3f7f-4f43-8006-c945a0a467ff": personioJob_1,
    "496559b5-a164-43cb-8d48-71963400ff68": personioJob_2,
    "146968c4-0022-4f51-b789-5227d62c307e": ashbyJob,

}

export const getJob = (id:string):Job | undefined => {
    return matchJob[id]()
}