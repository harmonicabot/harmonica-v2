import {
    SlashCommandBuilder,
    SlashCommandStringOption,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
} from "@discordjs/builders";
import {
    ButtonStyle,
    CommandInteraction,
    ComponentType,
    Message,
    ThreadAutoArchiveDuration,
} from "discord.js";
import Question from "../database/models/Question";

async function initQuestionThread(
    messageInstance: Message,
    title: string,
    questioner_id: string
) {
    const questionThread = await messageInstance.startThread({
        name: title,
        autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
    });

    questionThread.members.add(questioner_id);

    return questionThread;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ask")
        .setDescription("Ask a question form the current channel's members!")
        .setDMPermission(false)
        .addStringOption((option: SlashCommandStringOption) =>
            option.setName("question").setDescription("Your question").setRequired(true)
        ),
    executableInThread: false,
    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();

        const question = interaction.options.get("question", true).value as string;
        const questioner_id = interaction.user.id;

        const QuestionEmbed = new EmbedBuilder()
            .setTitle(question)
            .setAuthor({
                name: interaction.client.user.displayName,
                iconURL: interaction.client.user.avatarURL()!,
            })
            .setFields([
                { name: "**Method**", value: "Delphi method" },
                {
                    name: "**Started by**",
                    value: `<@${questioner_id}>`,
                },
                { name: "**Status**", value: "In progress" },
            ]);

        const joinButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder({
                custom_id: "join",
                label: "Begin your chat",
                type: ComponentType.Button,
                style: ButtonStyle.Primary,
            })
        );

        const questionMessage = await interaction.followUp({
            ephemeral: false,
            embeds: [QuestionEmbed],
            components: [joinButton],
        });

        const questionThread = await initQuestionThread(
            questionMessage,
            question,
            questioner_id
        );

        await(
            await Question.create({
                title: question,
                questioner_id,
                channel_id: interaction.channel?.id,
                thread_id: questionThread.id,
                message_id: questionMessage.id,
                method: "Delphi method",
                status: "In progress",
            })
        ).save();
    },
};
