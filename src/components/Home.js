import React, { useEffect, useState } from 'react';
import { formatTweet } from '../utils/helpers';
import Timeline from './Timeline';
import TweetForm from './TweetForm';
import { getAllTweetsService, saveTweetService } from '../services/UserService';
import { signPayload } from '../utils/crypto';

export default ({ currentUser }) => {
  const [tweets, setTweets] = useState([]);

  const loadTweets = async () => {
    const { publicKey, privateKey } = currentUser;
    const payload = {
      action: 'getAllTweets',
    };

    const signature = await signPayload(payload, privateKey);

    const {
      tweets: tweetsList,
      users: authors,
    } = await getAllTweetsService({ publicKey, signature, payload });

    const myTweets = Object.keys(tweetsList)
      .map((key) => {
        const tweet = tweetsList[key];
        const author = authors[tweet.author];
        return formatTweet(tweet, author);
      })
      .sort((a, b) => b.timestamp - a.timestamp);

    setTweets(myTweets);
  };

  const saveTweet = async (tweet) => {
    const { publicKey, privateKey } = currentUser;
    const payload = {
      action: 'saveTweet',
      tweet,
    };

    const signature = await signPayload(payload, privateKey);

    await saveTweetService({ publicKey, signature, payload });
    await loadTweets();
  };

  useEffect(() => {
    loadTweets();
  }, []);

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-2" />
        <div className="col-md-8">
          <h3 className="center">Post</h3>
          <TweetForm onSubmit={saveTweet} />
          <Timeline tweets={tweets} />
        </div>
        <div className="col-md-2" />
      </div>
    </div>
  );
};
