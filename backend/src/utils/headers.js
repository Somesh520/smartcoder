export const getHeaders = (slug, session, csrf) => ({
    'content-type': 'application/json',
    'origin': 'https://leetcode.com',
    'referer': slug ? `https://leetcode.com/problems/${slug}/` : 'https://leetcode.com/',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'x-csrftoken': csrf,
    'cookie': `LEETCODE_SESSION=${session}; csrftoken=${csrf};`,
    'x-requested-with': 'XMLHttpRequest'
});
