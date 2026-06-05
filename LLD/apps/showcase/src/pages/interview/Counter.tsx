import { useState } from 'react';

const Counter = () => {
  const [counter, setCounter] = useState(0);

  return (
    <div onClick={() => setCounter((prev) => prev + 1)}>
      Counter
      {counter}
    </div>
  );
};

export default Counter;
