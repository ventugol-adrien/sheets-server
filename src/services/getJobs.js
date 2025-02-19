const openAI = "3c7a8979-a7b6-492f-a636-825e203663c1";
export const openAIJob = () => {
    return { company: 'OpenAI', title: 'Forward Deployed Software Engineer',
        description: "About The Role/n/n"
            + "We are looking for customer-focused engineers to build effective, iterative solutions on OpenAI’s API."
            + " As an FDE, you’ll embed with customers, understand their domain, and co-develop solutions"
            + " to tackle real problems in often undefined or evolving problem spaces."
            + " You will collaborate closely with Sales, Solutions Engineering, Solutions Architects, and Customer Success Managers who work on the same account. "
            + " You will also work with our Research and Applied Product and Engineering teams to provide insightful customer feedback. "
            + " This role is based in our Munich office. We use a hybrid work model of 3 days in the office per week and offer relocation assistance to new employees."
            + "/n/nIn This Role, You Will/n/nEmbed deeply with strategic customers to "
            + "understand their business challenges and technical requirements in detail. "
            + "Design, architect, and develop full-stack solutions using an experiment-driven, iterative approach. "
            + "Prepare detailed scopes of work and project plans for both proof-of-concept prototypes and full production deployments."
            + " Work hands-on with customers' technical teams as a technical expert and trusted advisor, "
            + "coding side-by-side to drive projects to completion on their infrastructure. "
            + "Collaborate closely with Sales, Technical Success, and Applied teams to ensure seamless customer experiences, project success and actionable product feedback. "
            + "Contribute to internal knowledge bases, codifying best practices and sharing insights gained from customer engagements to scale the Forward Deployed Engineering function."
            + "/n/nYou’ll Thrive In This Role If You/n/n Have 4+ years of experience in software or customer engineering roles,"
            + " with a strong emphasis on customer-facing engagements. Are willing to travel up to 50% and work on-site with customers"
            + " to build strong relationships and deeply understand their needs. Have a track record of "
            + "rapidly prototyping ideas from your own volition and seeing them through to reality. Are proficient in front-end development using frameworks like React or Next.js, "
            + "and back-end development skills in Python, Node.js, or similar. Are familiar with deploying applications on cloud platforms such as AWS, GCP, or Azure."
            + " Are an effective communicator who can translate complex technical concepts to both technical and non-technical audiences with empathy and depth. "
            + " Have a bias for action and willingness to work iteratively with your customers to deliver the right solution that solves their problem. "
            + "Own problems end-to-end, and be willing to pick up whatever knowledge you're missing to get the job done."
            + "/n/nAbout OpenAI/n/nOpenAI is an AI research and deployment company dedicated to ensuring that general-purpose artificial intelligence benefits all of humanity. "
            + "We push the boundaries of the capabilities of AI systems and seek to safely deploy them to the world through our products. "
            + "AI is an extremely powerful tool that must be created with safety and human needs at its core, and to achieve our mission, "
            + "we must encompass and value the many different perspectives, voices, and experiences that form the full spectrum of humanity." };
};
export const getJob = (id) => {
    console.log("Attempting to get job matching id:", id);
    if (id === openAI) {
        return openAIJob();
    }
    return;
};
