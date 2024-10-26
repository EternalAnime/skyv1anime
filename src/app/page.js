"use server"
import Animecard from '@/components/CardComponent/Animecards'
import Herosection from '@/components/home/Herosection'
import Navbarcomponent from '@/components/navbar/Navbar'
import { TrendingAnilist, PopularAnilist, Top100Anilist, TopAniList, SeasonalAnilist, NextSeasonAnilist, PopularMoviesAnilist } from '@/lib/Anilistfunctions'
import React from 'react'
import VerticalList from '@/components/home/VerticalList'
import Genres from "@/components/home/genres";
import MWMovies from "@/components/home/mwm";
import ContinueWatching from '@/components/home/ContinueWatching'
import RecentEpisodes from '@/components/home/RecentEpisodes'
import { getAuthSession } from './api/auth/[...nextauth]/route'
import { redis } from '@/lib/rediscache'
import Greeting from '@/components/Greeting';
import Scheds from '@/components/Scheds';
import RandomTextComponent from '@/components/RandomTextComponent';
// import { getWatchHistory } from '@/lib/EpHistoryfunctions'

async function getHomePage() {
  try {
    let cachedData;
    if (redis) {
      cachedData = await redis.get(`homepage`);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        if (Object.keys(parsedData).length === 0) { // Check if data is an empty object
          await redis.del(`homepage`);
          cachedData = null;
        }
      }
    }
    if (cachedData) {
      const { herodata, populardata, top100data, topdata, seasonaldata, nextseasondata, popularmoviesdata } = JSON.parse(cachedData);
      return { herodata, populardata, top100data, topdata, seasonaldata, nextseasondata, popularmoviesdata };
    } else {
      const [herodata, populardata, top100data, topdata, seasonaldata, nextseasondata, popularmoviesdata ] = await Promise.all([
        TrendingAnilist(),
        PopularAnilist(),
        Top100Anilist(),
        TopAniList(),
        SeasonalAnilist(),
        NextSeasonAnilist(),
        PopularMoviesAnilist()
      ]);
      const cacheTime = 60 * 60 * 2;
      if (redis) {
        await redis.set(`homepage`, JSON.stringify({ herodata, populardata, top100data, topdata, seasonaldata, nextseasondata, popularmoviesdata }), "EX", cacheTime);
      }
      return { herodata, populardata, top100data, topdata, seasonaldata, nextseasondata, popularmoviesdata };
    }
  } catch (error) {
    console.error("Error fetching homepage from anilist: ", error);
    return null;
  }
}

async function Home() {
  const session = await getAuthSession();
  const { herodata = [], populardata = [], top100data = [], topdata = [], seasonaldata = [], nextseasondata = [], popularmoviesdata = [] } = await getHomePage();
  // const history = await getWatchHistory();
  // console.log(history)

  return (
    <div>
      <Navbarcomponent home={true} />
      <Herosection data={herodata} />
      <div className='sm:max-w-[97%] md:max-w-[95%] lg:max-w-[90%] xl:max-w-[85%] mx-auto flex flex-col md:gap-11 sm:gap-7 gap-5 mt-8'>
        <div> 
        <Greeting />
        <RandomTextComponent />
          <ContinueWatching session={session} />
        </div>
        <div
        >
          <RecentEpisodes cardid="Recent Episodes" />
        </div>
        <div
        >
 <Animecard data={herodata} cardid="Trending Now" />
        </div>
     <div
        >
          <Animecard data={populardata} cardid="Popular" />
        </div>
        <div
        >
          <Animecard data={seasonaldata} cardid="Popular This Season" />
        </div>
        <div
        >
          <Animecard data={popularmoviesdata} cardid="Popular Movies" />
        </div>
        <div
        >
          <Animecard data={top100data} cardid="Top Anime" />
        </div>
        <div
        >
        {/* <div // Add motion.div to each child component
              key="Genres"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Genres />
            </div> */}
          <div className='lg:flex lg:flex-row justify-between lg:gap-20'>
            <VerticalList data={topdata} mobiledata={seasonaldata} id="Top 100 Anime" />
            <VerticalList data={seasonaldata} id="Seasonal Anime" />
          </div>
          <div
        >
          <Animecard data={nextseasondata} cardid="Next Season" />
        </div>
          <Scheds />
          <div className="">
            <div className="max-w-screen-xl mx-auto px-4 py-3 items-center justify-between text-white sm:flex md:px-8">
                <div className="flex gap-x-4">
                    <div className="w-10 h-10 flex-none rounded-lg bg-indigo-800 flex items-center justify-center">
                        <svg xmlns="https://raw.githubusercontent.com/EternalAnime/skyv1anime/main/public/SKYANIME.png
" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                        </svg>
                    </div>
                    <p className="py-2 font-medium">
                        Watch Movies, TV Shows or even K-Dramas for FREE! only on SkyAnime!                 </p>
                </div>
                <a href="https://skyanime.site" className="inline-block w-full mt-3 py-2 px-3 text-center text-indigo-600 font-medium bg-white duration-150 hover:bg-gray-100 active:bg-gray-200 rounded-lg sm:w-auto sm:mt-0 sm:text-sm">
                    Try Now!
                </a>
            </div>
        </div>
        </div>
      </div>
    </div>
  )
}


export default Home
