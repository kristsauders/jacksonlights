"use client";
import { useState } from 'react';
import Tabs from './Tabs';
import Playlist from './Playlist';
import PhotoCarousel from './PhotoCarousel';
import VideoGallery from './VideoGallery';
import ShowInfo from './ShowInfo';
import PostsFeed from './PostsFeed';
import Donate from './Donate';
import SongRequests from './SongRequests';

export default function TabbedSections(){
  const [active,setActive] = useState('playlist');
  return (
    <div>
      <Tabs tabs={[
        { id:'playlist', label:'Song List' },
        { id:'gallery', label:'Photos' },
        { id:'videos', label:'Videos' },
        { id:'info', label:'About Us' },
        { id:'donate', label:'Donate' },
        { id:'requests', label:'Requests' },
        { id:'posts', label:'Behind the Scenes' }
      ]} initial={active} onChange={setActive} />
  <div className="mt-3 sm:mt-4 space-y-8 sm:space-y-10">
        {active==='playlist' && <Playlist />}
        {active==='gallery' && <PhotoCarousel />}
        {active==='videos' && <VideoGallery />}
        {active==='info' && <ShowInfo />}
  {active==='donate' && <Donate />}
  {active==='requests' && <SongRequests />}
  {active==='posts' && <PostsFeed />}
      </div>
    </div>
  );
}