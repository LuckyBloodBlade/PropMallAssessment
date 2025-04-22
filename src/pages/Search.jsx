import { useParams } from 'react-router-dom';

export default function Search() {
  const { location, year, search } = useParams();

  return (
    <div>
      <h1>Search Results</h1>
      <p>Location: {location}</p>
      <p>Year: {year}</p>
      <p>Search: {search}</p>
    </div>
  );
}
