import React from 'react';

const Home = () => (
  <div>
    <div>I'm the very best Home component</div>
    <button onClick={() => console.log('Hi there')}>Press me</button>
  </div>
);

export default {
  component: Home
};
