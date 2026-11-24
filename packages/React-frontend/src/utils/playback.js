export function createShuffleOrder(queueLength, currentTrackIndex) {
  const order = Array.from(
    { length: queueLength },
    (_, index) => index
  );

  for (let index = order.length - 1; index > 0; --index) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [order[index], order[randomIndex]] = [
      order[randomIndex],
      order[index]
    ];
  }

  const currentPosition = order.indexOf(currentTrackIndex);

  if (currentPosition > 0) {
    [order[0], order[currentPosition]] = [
      order[currentPosition],
      order[0],
    ]
  }

  return order;
}
