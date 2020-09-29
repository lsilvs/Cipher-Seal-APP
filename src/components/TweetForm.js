import React, { useState } from 'react';

export default () => {
  const [message, setMessage] = useState('');
  const charsLeft = 280 - message.length;

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <form className="new-tweet" onSubmit={handleSubmit}>
      <textarea
        placeholder="What's happenning?"
        value={message}
        onChange={handleChange}
        className="textarea"
        maxLength={280}
      />
      {/* show how many characters are left */}
      {charsLeft <= 100 && <div className="tweet-length">{charsLeft}</div>}

      {/* button is disabled if it's an empty string */}
      <button className="btn" type="submit" disabled={message === ''}>
        Submit
      </button>
    </form>
  );
};
