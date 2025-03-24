import axios from "axios";
const GOOGLE_TOKEN_INFO_URL = "https://www.googleapis.com/oauth2/v3/tokeninfo";
const GOOGLE_USER_INFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

export const verifyGoogleAccessToken = async (accessToken: string) => {
    // Verify the token
    const tokenInfoResponse = await axios.get(GOOGLE_TOKEN_INFO_URL, {
        params: {
            access_token: accessToken,
        },
    });

    if (tokenInfoResponse.data.aud !== process.env.GOOGLE_CLIENT_ID) {
        throw new Error("Invalid Google access token");
    }

    // Get user info
    const userInfoResponse = await axios.get(GOOGLE_USER_INFO_URL, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    return userInfoResponse.data;
};
