import { indexOf } from "lodash";
import { OpenAI } from "openai";

const openAIInstance = new OpenAI({
    apiKey: process.env.CHATGPT_API_KEY,
    organization: "org-vumbNnMathwrWoY4oD8FGOCq",
});

async function request(prompt: string) {
    const completion = await openAIInstance.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
    });

    return completion.choices[0].message.content;
}

function promptGenerator(
    question: string,
    answers: {
        answers: Array<Record<string, string>>;
        answerers_id: Array<string>;
    }
) {
    let questions_transcript = "";

    for (let index = 0; index < answers.answers.length; index++) {
        const answer = answers.answers[index];
        const p_num = indexOf(answers.answerers_id, answer.answerer_id) + 1;

        questions_transcript += `Participant ${p_num} said: ` + answer.content + "\n";
    }

    return `
    The topic given to the participants was:

    '${question}'

    The goal is to come quickly to a consensus, so
    use the below transcript to identify potential
    consensus positions or if that is not possible,
    respond with questions to all participants to
    help elicit more information and/or guide
    them towards a potential common consensus
    position.

    '${questions_transcript}'                     
    `;
}

export async function reporter(
    question: string,
    answers: {
        answers: Array<Record<string, string>>;
        answerers_id: Array<string>;
    }
) {
    const prompt = promptGenerator(question, answers);

    return await request(prompt);
}
