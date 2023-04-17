import type {
  SocialActor,
  SocialActorData,
} from '$lib/entities/SocialActor.js';

export function getActorIcon(
  actor: (SocialActor & SocialActorData) | null | undefined
) {
  if (!actor || !actor.icon) {
    return `https://placehold.co/128x128?text=${encodeURIComponent(':)')}`;
  }

  if (Array.isArray(actor.icon)) {
    if (typeof actor.icon[0] === 'string') {
      return actor.icon[0];
    }

    return (
      actor.icon[0]?.url ||
      actor.icon[0]?.href ||
      `https://placehold.co/128x128?text=${encodeURIComponent(
        actor.name || ':)'
      )}`
    );
  }

  if (typeof actor.icon === 'string') {
    return actor.icon;
  }

  return (
    actor.icon?.url ||
    actor.icon?.href ||
    `https://placehold.co/128x128?text=${encodeURIComponent(
      actor.name || ':)'
    )}`
  );
}
