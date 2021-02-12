import React from 'react';
import { withRouter } from 'react-router-dom'
import './style.css';

class Omoge extends React.Component {

  state = {
    unlock: '',
  }

  handleChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  moveToGallery = () => {
    this.props.history.push('/omoge/gallery')
  }

  render() {
    const { unlock } = this.state;

    return (
      <div className="omoge-page">
        <h1>Letter to Aduke</h1>
        <p className="note">
          My beloved, ayaa mi, I thought about this for a while, actually this is the cool thing I said I wanted to build that day (I don’t know if you remember). 
          Anyways, I’ve spent days trying to know what I want to put down, I’ve not sent you an email as well in a while Cos I just want to pour out my heart to you in one place (for some reason I’m almost in tears writing this <span role="img" aria-label="laugh">😂</span>, you know how emotional I can get). 
          It’s been an amazing past couple of weeks and loving you every single day makes me feel sooooooo good ugh (okay now I’m in tears). By the way, I wrote this whole thing on different days, today is that day where I watched greys anatomy and cried for most of the day.
          Loving you will always be a big deal for me, I feel like I’ve won in life, I feel like my heart is in the right place, also I noticed that loving you more and more, makes me love you more and more (I don't know if that makes sense). 
          <br/>
          Falling in love with you was so graceful and organic, and loving you everyday no matter what is even more graceful.
          <br/>
          Loving you makes me feel like Spider-Man (I remember telling Adekite this before we got together then).
          <br/>
          Loving you makes me feel on top of the world. I also want to be your world, and I want you to be on top of your world <span role="img" aria-label="wink">😉</span>.
          <br/>
          The day I decided to love you everyday no matter what, was a big day for me (as cheesy as this may sound).
          <br/>
          I know we had to refresh and start all over, but how I feel about you has never changed.
          <br/>
          Lmao! I just remembered you trying to woo me, I’m definitely telling our kids about that.
          <br/>
          I love your smile, it’s the most beautiful thing. I feel joyful whenever you smile, Cos I know it’s genuine.
          <br/>
          I love your mysterious eyes, I’ve still not been able to decipher them <span role="img" aria-label="laugh">😂</span>, one day I will. 
          <br/>
          I love how you look whenever you have a blank stare, your resting bitch face automatically sets in. Also, one of these days I’ll show you what I mean when I say you have a mischievous look <span role="img" aria-label="smirk">😏</span>.
          <br/>
          I love your nose, it so cute and it’s crazy how massaging it can be so relaxing even for me as much as it is for you.
          <br/>
          I love your ears, even if I don’t get to see them dance lol.
          <br/>
          I love how you talkkkkkkkkkkkkkkkk, hearing you talk gives me an eargasm most of the time (that’s one of the first things that attracted me to you btw)
          <br/>
          I love how you wink, it’s too cute watching you wink. I love it sooooooo much.
          <br/>
          I love how you tease me, it’s supposed to be annoying, but I know it comes from a place of love and it always makes me smile.
          <br/>
          I love how you scold me too, and tell me truth <span role="img" aria-label="cry">😪 😭</span>
          <br/>
          I love how you ride for the people you love no matter what!
          <br/>
          Ouuuuuu I love how you walk, especially when you know I’m watching <span role="img" aria-label="wink">😉</span>.
          <br/>
          I love how independent and self sustaining you can be, doesn’t mean I won’t still always worry about you my love. You’ll always be my queen Olatundun.
          <br/>
          I love how you rant to me, I’m so glad you even rant to me at all even if I know I can be really annoying sometimes <span role="img" aria-label="cry">😭😭</span>.
          <br/>
          I love how you hiss, it’s the cutest thing ever. It looks like you’re pouting or trying to blow me a kiss <span role="img" aria-label="cute">🥺🥺</span>.
          <br/>
          I love everything about you Olatundun Motunrayo Okenla.
          <br/>
          There are some other things I love, but I’ll whisper them into your ears when I see you <span role="img" aria-label="wink">😉</span> 
          <br/>
          You actually make my world stop, I thought about this statement and realized that that's what I've been telling you anytime I say when I'm with you or talk to you or around you, I stop thinking, my world actually stops.
          <br/>
          Thank you for choosing me. Thank you for the opportunity to love you, thank you for the opportunity to care for you, thank you for the opportunity to walk this earth beside you.
          <br/>
          I thank God for you everyday, and I pray everything works out for us the way we want <span role="img" aria-label="pray">🙏🏿</span>. 
          <br/>
          <br/>
          I'm also sorry for everytime I've been an ass or I'm annoying or I do something stupid, and oh my unneccessary drama <span role="img" aria-label="sob">🥺</span>.
          <br/>
          I'm also sorry for all the days I didn't tell you that I love you <span role="img" aria-label="sob">🥺</span>.
          <br/>
          I'm also sorry for all the days I didn't ask you to say balabamba if you could hear me (I wrote this today btw)<span role="img" aria-label="sob">🥺</span>.
          <br/>
          I want you, I want this (us), and I want forever with you.
          <br/>
          You're all my women as I am all your men and more.
          <br/>
          I love you Aduke mi
          <br/>
          - PS this was why I was smiling the day I was smiling cos of my work, and yes I love my work.
        </p>
        <p className="note-from">
        — Jbaby
        </p>
        <div className="bottom-section mt-4">

          <div className="form">
            <p>What is that one part of your body that I love so much, and I always say it more than any other one <span role="img" aria-label="eyes">👀</span></p>
            <input type="text" className="unlock-input" value={unlock} name="unlock" onChange={this.handleChange} />
          </div>

          <div className="text-right mt-5">
            {['eyes', 'my eyes', 'eye', 'your eyes'].includes(unlock) &&
              <button className="btn btn-next" onClick={this.moveToGallery}>
                Move to the next stage
              </button>
            }
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(Omoge);
