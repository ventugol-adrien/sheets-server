import { assert } from 'console';
export const castToJob = (dbResponse) => {
    if (dbResponse) {
        assert(typeof dbResponse.company === "string"
            && typeof dbResponse.title === "string"
            && typeof dbResponse.description === "string"
            && typeof dbResponse.link === "string"
            && typeof dbResponse.favicon === "string");
        return { company: dbResponse.company,
            title: dbResponse.title,
            description: dbResponse.description,
            link: dbResponse.link,
            favicon: dbResponse.favicon
        };
    }
    else {
        throw TypeError("dbResponse is null or undefined.");
    }
};
