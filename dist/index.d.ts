declare let options: {
    url: string;
    username: string;
    password: string;
};
declare const OCMODRefresh: (settings: typeof options) => void;
export default OCMODRefresh;
