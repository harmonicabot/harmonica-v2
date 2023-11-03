import {
    Events,
    BaseInteraction,
    ActionRowBuilder,
    ButtonBuilder,
    ComponentType,
    ButtonStyle,
} from "discord.js";
import { ClientError } from "../utils/ClientError";
import Question from "../database/models/Question";

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction: BaseInteraction) {
        if (interaction.isCommand()) {
            // @ts-ignore
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(
                    `No command matching ${interaction.commandName} was found.`
                );
                return;
            }

            try {
                if (interaction.channel?.isThread() === command.executableInThread) {
                    await command.execute(interaction);
                } else {
                    throw new ClientError(
                        `You can not execute the command in ${
                            interaction.channel?.isThread() ? "Threads" : "Channels"
                        }!`
                    );
                }
            } catch (error) {
                if (error instanceof ClientError) {
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({
                            ephemeral: true,
                            content: error.message,
                        });
                    } else {
                        await interaction.reply({
                            ephemeral: true,
                            content: error.message,
                        });
                    }
                } else {
                    console.log(error);

                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({
                            content: "There was an error while executing this command!",
                            ephemeral: true,
                        });
                    } else {
                        await interaction.reply({
                            content: "There was an error while executing this command!",
                            ephemeral: true,
                        });
                    }
                }
            }
        } else if (interaction.isButton()) {
            try {
                if (interaction.customId === "join") {
                    await interaction.deferReply({ ephemeral: true });

                    const answerer_id = interaction.user.id;
                    const question_instance = await Question.findOne({
                        session_members: answerer_id,
                        message_id: interaction.message.id,
                    });

                    if (!question_instance) {
                        const question = interaction.message.embeds[0].title!;
                        const DMChannel = await interaction.user.createDM(true);
                        const navigatorToThread =
                            new ActionRowBuilder<ButtonBuilder>().addComponents(
                                new ButtonBuilder({
                                    label: "Navigate into the thread",
                                    url: interaction.message.thread?.url,
                                    type: ComponentType.Button,
                                    style: ButtonStyle.Link,
                                })
                            );
                        const navigatorToDM =
                            new ActionRowBuilder<ButtonBuilder>().addComponents(
                                new ButtonBuilder({
                                    label: "Let's chat!",
                                    url: DMChannel.url,
                                    type: ComponentType.Button,
                                    style: ButtonStyle.Link,
                                })
                            );

                        interaction.message.thread?.members.add(answerer_id);
                        DMChannel.send({
                            content: question,
                        });
                        interaction.followUp({
                            content: "You've joined to the question thread.",
                            ephemeral: true,
                            components: [navigatorToDM, navigatorToThread],
                        });
                        await Question.updateMany(
                            { message_id: { $ne: interaction.message.id } },
                            { $pull: { session_members: answerer_id } }
                        );
                        await Question.updateOne(
                            { message_id: interaction.message.id },
                            { $push: { session_members: answerer_id } }
                        );
                    } else {
                        interaction.followUp({
                            content: "You joined before!",
                            ephemeral: true,
                        });
                    }
                }
            } catch (error) {
                if (error instanceof ClientError) {
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({
                            ephemeral: true,
                            content: error.message,
                        });
                    } else {
                        await interaction.reply({
                            ephemeral: true,
                            content: error.message,
                        });
                    }
                } else {
                    console.log(error);

                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({
                            content: "There was an error while executing this command!",
                            ephemeral: true,
                        });
                    } else {
                        await interaction.reply({
                            content: "There was an error while executing this command!",
                            ephemeral: true,
                        });
                    }
                }
            }
        } else {
            return;
        }
    },
};
