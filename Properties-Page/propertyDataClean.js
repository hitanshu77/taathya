const propertyDataClean = propertyCardsData.map((card) => {
  const primaryCategory = Array.isArray(card.categories) && card.categories.length > 0
    ? card.categories[0]
    : null;

  return {
    schemeName: card.schemeName ?? "",
    propertyLocation: card.propertyLocation ?? "",
    locationTag: card.locationTag ?? "",
    bhk: primaryCategory?.bhk ?? card.title ?? "",
    sqft: primaryCategory?.sqft ?? card.sqft ?? "",
    priceText: primaryCategory?.price ?? card.priceText ?? "",
    images: Array.isArray(card.images) ? card.images : [],
    features: Array.isArray(card.features) ? card.features : [],
  };
});

