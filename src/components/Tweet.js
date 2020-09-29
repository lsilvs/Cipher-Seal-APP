import React from 'react';
import {
  TiArrowBackOutline,
  TiHeartOutline,
  TiHeartFullOutline,
} from 'react-icons/ti';
import { formatDate } from '../utils/helpers';

export default ({ tweet }) => {
  const {
    name,
    avatar,
    timestamp,
    text,
    hasLiked,
    likes,
    replies,
    id,
    parent,
  } = tweet;

  const toParent = (e) => {
    e.preventDefault();
  };

  const handleLike = (e) => {
    e.preventDefault();
  };

  return (
    <div to={`/tweet/${id}`} className="tweet">
      <img src={avatar} alt={`Avatar of ${name}`} className="avatar" />

      <div className="tweet-info">
        <div>
          <span>{name}</span>
          <div>
            {formatDate(timestamp)}
            {' '}
          </div>
          {parent && (
          <button
            type="submit"
            className="replying-to"
            onClick={(e) => toParent(e, parent.id)}
          >
            Replying to @
            {parent.author}
          </button>
          )}
          <p>{text}</p>
        </div>

        <div className="tweet-icons">
          <TiArrowBackOutline className="tweet-icon" />
          <span>
            {replies !== 0 && replies}
            {' '}
          </span>
          <button type="submit" className="heart-button" onClick={handleLike}>
            {hasLiked === true ? (
              <TiHeartFullOutline color="#e0245e" className="tweet-icon" />
            ) : (
              <TiHeartOutline className="tweet-icon" />
            )}
          </button>
          <span>
            {likes !== 0 && likes}
            {' '}
          </span>
        </div>
      </div>
    </div>
  );
};
