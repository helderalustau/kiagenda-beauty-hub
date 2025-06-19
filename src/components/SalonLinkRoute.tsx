
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SalonLink from '@/pages/SalonLink';

const SalonLinkRoute = () => {
  return (
    <Routes>
      <Route path="/:slug" element={<SalonLink />} />
    </Routes>
  );
};

export default SalonLinkRoute;
