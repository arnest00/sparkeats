/**
 * Locations
 * @module locations
 * This module transforms the legacy location data into an updated `locations` object.
 * The data was migrated from SQL tables to JSON and image files using the `migrate_sparkeats.cljs` script.
 */

import legacyPlaces from '../data/place.json';
import legacyReviews from '../data/review.json';
import legacyPlaceImages from '../data/placeImage.json';
import legacyReviewImages from '../data/reviewImage.json';
import { Location, Review } from './types/sparkeats';

type LegacyPlace = {
  createdAt: number;
  updatedAt: number;
  id: number;
  placeName: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  placeImage: string;
  fd: string;
  placeImageAlt: string;
  placeURL: string;
  placeWebsiteDisplay: string;
};

type LegacyImage = {
  createdAt: number;
  updatedAt: number;
  fd: string;
  file: { type: string; data: number[] };
  id: number;
};

type LegacyReview = {
  createdAt: number;
  updatedAt: number;
  id: number;
  reviewText: string;
  reviewerName: string;
  numberOfStars: number;
  reviewImage: string;
  reviewImageAlt: string;
  placeId: number;
};

function getImageURL(
  imagePath: string,
  imageID: string,
  legacyImages: LegacyImage[]
) {
  const imageName = legacyImages.find(
    (image) => image.id.toString() === imageID
  )?.fd;
  return imageName
    ? `${imagePath}${imageName}`
    : 'img/location-card-header_bg.png';
}

function getImageDescription(imageDescription: string) {
  return imageDescription || 'Placeholder image description';
}

function getLocationURL(id: number): string {
  return `locations/${id}`;
}

function transformReview({
  id,
  reviewerName,
  reviewText: text,
  numberOfStars: starRating,
  reviewImage: imageID,
  reviewImageAlt,
  placeId: placeID,
}: LegacyReview): Review {
  return {
    id,
    reviewerName,
    text,
    imageURL: getImageURL('img/reviews/', imageID, legacyReviewImages),
    imageDescription: getImageDescription(reviewImageAlt),
    starRating,
    placeID,
  };
}

function getReviews(placeID: number) {
  return legacyReviews
    .filter((legacyReview) => legacyReview.placeId === placeID)
    .map(transformReview);
}

function transformLocations(legacyPlaces: LegacyPlace[]): Location[] {
  return legacyPlaces.map(
    ({
      id,
      placeName: name,
      city,
      state: region,
      address,
      phone,
      placeURL: url,
      placeImage: imageID,
      placeImageAlt,
    }) => {
      return {
        id,
        name,
        city,
        region,
        country: '', // TODO
        address,
        phone,
        url,
        locationURL: getLocationURL(id),
        imageURL: getImageURL('img/locations/', imageID, legacyPlaceImages),
        imageDescription: getImageDescription(placeImageAlt),
        reviews: getReviews(id),
      };
    }
  );
}

const locations = transformLocations(legacyPlaces);

export { locations };
