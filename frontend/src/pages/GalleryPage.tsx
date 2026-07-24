import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getGallery } from '../services/api';
import { GalleryGrid } from '../components/GalleryGrid';
import { ImageModal } from '../components/ImageModal';
import { Loader } from '../components/Loader';
import { ErrorState } from '../components/ErrorState';

export const GalleryPage: React.FC = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['gallery'],
    queryFn: getGallery,
  });

  if (isLoading) return <Loader label="Loading Architectural Gallery..." />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  return (
    <>
      <GalleryGrid items={data} />
      <ImageModal />
    </>
  );
};
