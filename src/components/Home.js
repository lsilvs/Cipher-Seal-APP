import React, { useEffect, useState } from 'react';
import { getInitialTweets } from '../utils/api';
import { formatTweet } from '../utils/helpers';
import Timeline from './Timeline';
import TweetForm from './TweetForm';

export default () => {
  const [tweets, setTweets] = useState([]);

  const loadTweets = async () => {
    const { tweets: tweetsList, users: authors } = await getInitialTweets();

    const myTweets = Object.keys(tweetsList)
      .map((key) => {
        const tweet = tweetsList[key];
        const author = authors[tweet.author];
        return formatTweet(tweet, author);
      })
      .sort((a, b) => b.timestamp - a.timestamp);

    setTweets(myTweets);
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
          <TweetForm />
          <Timeline tweets={tweets} />
        </div>
        <div className="col-md-2" />
      </div>
    </div>
  );
};
