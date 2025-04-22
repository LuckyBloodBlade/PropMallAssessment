import { useParams } from 'react-router-dom';

export default function Property() {
  const { slug } = useParams();
  const parts = slug.split('-');
  const id = parts[parts.length - 1];
  const title = parts.slice(0, -1).join('-');

  return (
    <div>
      <h2>{title}</h2>
      <p>Property ID: {id}</p>
    </div>
  );
}