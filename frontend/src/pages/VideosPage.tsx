import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getVideos } from '../services/api';
import { VideoPlayer } from '../components/VideoPlayer';
import { Loader } from '../components/Loader';
import { ErrorState } from '../components/ErrorState';

export const VideosPage: React.FC = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['videos'],
    queryFn: getVideos,
  });

  if (isLoading) return <Loader label="Loading Video Showcase..." />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  return <VideoPlayer videos={data} />;
};
