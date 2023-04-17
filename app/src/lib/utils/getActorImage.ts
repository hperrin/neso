import type {
  SocialActor,
  SocialActorData,
} from '$lib/entities/SocialActor.js';

export function getActorImage(
  actor: (SocialActor & SocialActorData) | null | undefined
) {
  if (!actor || !actor.image) {
    return `https://placehold.co/128x128?text=${encodeURIComponent(':)')}`;
  }

  if (Array.isArray(actor.image)) {
    if (typeof actor.image[0] === 'string') {
      return actor.image[0];
    }

    return (
      actor.image[0]?.url ||
      actor.image[0]?.href ||
      `https://placehold.co/128x128?text=${encodeURIComponent(
        actor.name || ':)'
      )}`
    );
  }

  if (typeof actor.image === 'string') {
    return actor.image;
  }

  return (
    actor.image?.url ||
    actor.image?.href ||
    `https://placehold.co/128x128?text=${encodeURIComponent(
      actor.name || ':)'
    )}`
  );
}
