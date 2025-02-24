import { v4 as v4 } from 'uuid';
import { createInterface as  createInterface} from 'readline'
import { configDotenv as configDotenv } from 'dotenv';
import {putValuesREST as putValuesREST} from './src/services/getSheets.js'

configDotenv();
const id = v4()
const rl = createInterface({
    input: process.stdin,
    output: process.stdout
})

const prompt = (question) => {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer)
        })
    })
}

async function main(){
    try {
        const company = await prompt('Enter Company name: ')
        const title = await prompt('Enter Job title: ')
        const link = await prompt('Enter link to job posting: ')
        const favicon = await prompt('Enter favicon link: ')
        const description = await prompt('Enter job description: ')

        console.log("Created job for the following company/id:",company,id)
        console.log("updating spreadsheet...")
        putValuesREST(process.env.SHEET_ID,"Links",[[company,`${process.env.WEB_URL}${id}`]])
        console.log("spreadsheet updated.")

        const createdJob = {company,title,link,favicon,description}

        console.log("Created the following job object:",createdJob)

    } catch (error){
        console.error('An error occurred:', error);
    } finally {
        rl.close()
    }
}

main()