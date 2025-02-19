export interface Question {
    question: string,
    time: string,
    theme: string,
    asker:string,
}

export interface Job {
    company: string,
    title: string,
    description: string,
    link?:string,
}