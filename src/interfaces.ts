interface DiscoursePost {
    id: number;
    cooked: string;
}

export interface DiscourseURLContent {
    post_stream: {
        posts: DiscoursePost[];
    };
}

export interface DiscordSummarizeInput {
    [key: string]: {
        [key: string]: string;
    };
}

export interface IMA {
    channel: { [key: string]: string };
    [key: string]: { [key: string]: string };
}
