import { assert } from 'console'
import * as mongo from 'mongodb'
export interface Question {
    question: string,
    time: string,
    theme: string,
    asker:string,
}

export interface  Job{
    company: string,
    title: string,
    description: string,
    link?:string,
    favicon?:string
}

export type IdJob = {id:string} & Job

export const castToJob = (dbResponse:mongo.WithId<mongo.BSON.Document> | null):Job => {
    if (dbResponse){
        assert(typeof dbResponse.company === "string" 
            && typeof dbResponse.title === "string" 
            && typeof dbResponse.description === "string"
            && typeof dbResponse.link === "string"
            && typeof dbResponse.favicon === "string")
            return {company:dbResponse.company,
                 title: dbResponse.title,
                  description: dbResponse.description,
                   link: dbResponse.link,
                favicon:dbResponse.favicon
            }

    } else {
        throw TypeError("dbResponse is null or undefined.")
    }
}