export default async (...params) => {
  const res = await fetch(...params);

  if (!res.ok) { throw res; }

  return res.json();
};
