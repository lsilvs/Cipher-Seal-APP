export function formatDate(timestamp) {
  const d = new Date(timestamp);
  const time = d.toLocaleTimeString('en-US');
  return `${time.substr(0, 5) + time.slice(-2)} | ${d.toLocaleDateString()}`;
}

export function formatTweet(tweet, author, authedUser, parentTweet) {
  const {
    id, likes, replies, text, timestamp, signature,
  } = tweet;

  const { username: authorUsername, publicKey: authorPublicKey } = author;

  return {
    id,
    timestamp,
    text,
    authorUsername,
    authorPublicKey,
    signature,
    likes: likes.length,
    replies: replies.length,
    hasLiked: likes.includes(authedUser),
    parent: !parentTweet ? null : {
      author: parentTweet.author,
      id: parentTweet.id,
    },
  };
}
