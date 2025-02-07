import React from 'react';

const AnimationClip = () => {
  return (
    <div>
      {/* Add your animation video clip here */}
      <video width="320" height="240" controls>
        <source src="path_to_your_animation_clip.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default AnimationClip;
