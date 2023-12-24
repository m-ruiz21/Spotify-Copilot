import { ClientOptions, OpenAI } from 'openai';

const OPEN_AI_KEY = process.env.OPEN_AI_KEY

class OpenAiSingleton {
    private static instance: OpenAI;

    private constructor() {}

    public static getInstance(): OpenAI {
        if (!OpenAiSingleton.instance) {
            const options: ClientOptions = {
                apiKey: OPEN_AI_KEY!
            }
            OpenAiSingleton.instance = new OpenAI(options);
        }

        return OpenAiSingleton.instance;
    }
}