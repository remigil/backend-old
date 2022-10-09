exports.getPagination = (size, page) => {
  limit = size ? +size : 10;
  offset = parseInt(page) ? (parseInt(page) - 1) * limit : 1;

  return { limit, offset };
};

exports.getPagingData = (count, limit) => {
  totalItems = count;
  totalPages = Math.ceil(totalItems / limit);

  return { totalItems, totalPages };
};
