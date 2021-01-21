import React, { useEffect, useState } from 'react';
import { getMediumPosts } from '../../api';
import Storyitem from '../../components/StoryItem';
import './style.css';

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLaoding] = useState(false);

  useEffect(() => {
    setLaoding(true)
    getMediumPosts()
    .then(data => {
      setLaoding(false)
      setStories(data.items);
    });
  }, [])

  return (
    <div className="stories-page">
      {loading &&
        <h1>. . .</h1>
      }
      <div className="stories-section">
      <h1><span role="img" aria-label="story">📜 </span>My Stories</h1>
      {stories?.map(story => {
        return (
          <Storyitem story={story} key={Math.random()} />
        )
      })}
      </div>
    </div>
  )
}

export default Stories;

// author: "Oluwajuwon Fagbohungbe"
// categories: ["codewars", "string", "algorithms", "javascript"]
// content: "↵<figure><img alt="" src="https://cdn-images-1.medium.com/max/1024/1*pRCtIJtrOIoJDyj_LIz6-g.jpeg"></figure><p>Earlier today I was working on a <a href="https://www.codewars.com/kata/517abf86da9663f1d2000003/solutions/javascript">challenge</a> on Codewars or as they’re popularly called; `Kata`. While working on it I also did some research on how I could go about solving it, and I stumbled on a string method I had never used before. The replace() method.</p>↵<h3>String.prototype.replace()</h3>↵<p>According to <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace">MDN</a>, the replace method returns a new string after all or part of it has been replaced based on a replacement pattern/string.<br>The pattern could be a substring or a regular expression (I’m guessing you all know about regular expressions, if you don’t you can check <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions">this</a> out).</p>↵<p>The replace method takes in two arguments: <br>1. The pattern or substring to be matched.<br>2. The new String/Substring or a function that returns a new string, to replace the matched string.</p>↵<p>Let’s have a look at the replace syntax</p>↵<pre>const newString = string.replace(substring/pattern, newstring/function)</pre>↵<h4>Solving the challenge</h4>↵<figure><img alt="" src="https://cdn-images-1.medium.com/max/859/1*s_QKl4kgYiYA_6VOL1ghWg.png"><figcaption>The challenge to Convert string to camel case — Codewars</figcaption></figure><p>What we want to do is find all the characters in the given string that match either the underscore( _ ) or the hyphen (-) and the alphabets after them, transform them to uppercase letters and remove the non-alphabetic characters</p>↵<p>First of all, since the replace method can take a regular expression to be used for matching, we can create an expression that matches what we want to replace.</p>↵<pre>const regExp = /[^a-z][a-z]/gi</pre>↵<p>Let’s break down the regular expression above</p>↵<pre>[^a-z] - this matches any character in the string that is not an alphabet from a-z</pre>↵<pre>[a-z] - this matches any character in the string that is an alphabet from a-z</pre>↵<pre>g - global, to make sure it checks the whole string</pre>↵<pre>i - insensitive, to make sure it doesn't bother about the case of the string</pre>↵<p>Now that we’ve found how to match the string/characters we want to work on, we should also figure out how to replace them in the string.</p>↵<p>Let’s create a function as the second parameter that can take the matched characters in the string and convert them to the new characters we want.</p>↵<pre>const newWord = word =&gt; word.toUpperCase().replace(/[^a-z]/gi, '')</pre>↵<p>Breakdown of the function above</p>↵<pre>word.toUpperCase() - this transforms the matched characters to uppercase</pre>↵<pre>replace(/[^a-z]/gi, '') - this replaces the transformed characters that aren't alphabets from a-z with empty strings</pre>↵<h4>The full method for the solution</h4>↵<pre>const toCamelCase = str =&gt; {<br>  return newWord = str.replace(/[^a-z][a-z]/gi, word =&gt; word.toUpperCase().replace(/[^a-z]/gi, ''))<br>}</pre>↵<p>I’m sure there are several ways to have solved this particular problem, but using the replace method seems very straightforward and easy to use.</p>↵<p>You can also comment with your own solutions or questions.</p>↵<p>I hope this helps someone out…</p>↵<p>You can also reach me on <a href="https://twitter.com/The_Oluwajuwon">Twitter</a> ✌️</p>↵<img src="https://medium.com/_/stat?event=post.clientViewed&amp;referrerSource=full_rss&amp;postId=d03cee4d843e" width="1" height="1" alt="">↵"
// description: "↵<figure><img alt="" src="https://cdn-images-1.medium.com/max/1024/1*pRCtIJtrOIoJDyj_LIz6-g.jpeg"></figure><p>Earlier today I was working on a <a href="https://www.codewars.com/kata/517abf86da9663f1d2000003/solutions/javascript">challenge</a> on Codewars or as they’re popularly called; `Kata`. While working on it I also did some research on how I could go about solving it, and I stumbled on a string method I had never used before. The replace() method.</p>↵<h3>String.prototype.replace()</h3>↵<p>According to <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace">MDN</a>, the replace method returns a new string after all or part of it has been replaced based on a replacement pattern/string.<br>The pattern could be a substring or a regular expression (I’m guessing you all know about regular expressions, if you don’t you can check <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions">this</a> out).</p>↵<p>The replace method takes in two arguments: <br>1. The pattern or substring to be matched.<br>2. The new String/Substring or a function that returns a new string, to replace the matched string.</p>↵<p>Let’s have a look at the replace syntax</p>↵<pre>const newString = string.replace(substring/pattern, newstring/function)</pre>↵<h4>Solving the challenge</h4>↵<figure><img alt="" src="https://cdn-images-1.medium.com/max/859/1*s_QKl4kgYiYA_6VOL1ghWg.png"><figcaption>The challenge to Convert string to camel case — Codewars</figcaption></figure><p>What we want to do is find all the characters in the given string that match either the underscore( _ ) or the hyphen (-) and the alphabets after them, transform them to uppercase letters and remove the non-alphabetic characters</p>↵<p>First of all, since the replace method can take a regular expression to be used for matching, we can create an expression that matches what we want to replace.</p>↵<pre>const regExp = /[^a-z][a-z]/gi</pre>↵<p>Let’s break down the regular expression above</p>↵<pre>[^a-z] - this matches any character in the string that is not an alphabet from a-z</pre>↵<pre>[a-z] - this matches any character in the string that is an alphabet from a-z</pre>↵<pre>g - global, to make sure it checks the whole string</pre>↵<pre>i - insensitive, to make sure it doesn't bother about the case of the string</pre>↵<p>Now that we’ve found how to match the string/characters we want to work on, we should also figure out how to replace them in the string.</p>↵<p>Let’s create a function as the second parameter that can take the matched characters in the string and convert them to the new characters we want.</p>↵<pre>const newWord = word =&gt; word.toUpperCase().replace(/[^a-z]/gi, '')</pre>↵<p>Breakdown of the function above</p>↵<pre>word.toUpperCase() - this transforms the matched characters to uppercase</pre>↵<pre>replace(/[^a-z]/gi, '') - this replaces the transformed characters that aren't alphabets from a-z with empty strings</pre>↵<h4>The full method for the solution</h4>↵<pre>const toCamelCase = str =&gt; {<br>  return newWord = str.replace(/[^a-z][a-z]/gi, word =&gt; word.toUpperCase().replace(/[^a-z]/gi, ''))<br>}</pre>↵<p>I’m sure there are several ways to have solved this particular problem, but using the replace method seems very straightforward and easy to use.</p>↵<p>You can also comment with your own solutions or questions.</p>↵<p>I hope this helps someone out…</p>↵<p>You can also reach me on <a href="https://twitter.com/The_Oluwajuwon">Twitter</a> ✌️</p>↵<img src="https://medium.com/_/stat?event=post.clientViewed&amp;referrerSource=full_rss&amp;postId=d03cee4d843e" width="1" height="1" alt="">↵"
// enclosure: {}
// guid: "https://medium.com/p/d03cee4d843e"
// link: "https://medium.com/@jfagbohungbe/using-the-string-replace-method-in-javascript-d03cee4d843e?source=rss-9e16766bfa6a------2"
// pubDate: "2019-10-18 17:41:56"
// thumbnail: "https://cdn-images-1.medium.com/max/1024/1*pRCtIJtrOIoJDyj_LIz6-g.jpeg"
// title: "Using the string.replace method in Javascript"