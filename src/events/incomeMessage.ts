import { Events, Message } from "discord.js";
import Question from "../database/models/Question";
import { reporter } from "../utils/ChatGPT";
import { find } from "lodash";

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message: Message) {
        if (message.channel.isDMBased() && !message.author.bot) {
            const answerer_id = message.author.id;
            const answerer_name = message.author.displayName;
            const DMChannel_id = message.channel.id;
            const answer = message.content;

            const question_instance = await Question.findOne({
                session_members: answerer_id,
            });

            if (question_instance) {
                question_instance.answers.push({
                    answerer_id,
                    answerer_name,
                    channel_id: DMChannel_id,
                    content: answer,
                });

                question_instance.save();

                if (question_instance.answers.length > 1) {
                    const answers_struct: {
                        answers: Array<Record<string, string>>;
                        answerers_id: Array<string>;
                    } = { answers: [], answerers_id: [] };
                    const channels_id: Array<string> = [question_instance.thread_id!];

                    for (
                        let index = 0;
                        index < question_instance.answers.length;
                        index++
                    ) {
                        const answer = question_instance.answers[index];

                        if (
                            find(
                                channels_id,
                                (channel_id) => channel_id === answer.channel_id
                            ) === undefined
                        ) {
                            channels_id.push(answer.channel_id!);
                        }

                        if (
                            find(
                                answers_struct.answerers_id,
                                (answerer_id) => answerer_id === answer.answerer_id
                            ) === undefined
                        ) {
                            answers_struct.answerers_id.push(answer.answerer_id!);
                        }

                        answers_struct.answers.push({
                            content: answer.content!,
                            answerer_id: answer.answerer_id!,
                        });
                    }

                    const report = await reporter(
                        question_instance.title!,
                        answers_struct
                    );

                    for (let index = 0; index < channels_id.length; index++) {
                        const channel = await message.client?.channels.fetch(
                            channels_id[index]
                        );

                        if (channel?.isTextBased()) {
                            channel.send({
                                content: report!,
                            });
                        }
                    }
                } else {
                    return;
                }
            } else {
                return;
            }
        } else {
            return;
        }
    },
};
