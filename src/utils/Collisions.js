/**
 * Hjelpefunksjoner for kollisjonsdeteksjon
 */

// Standard rektangel mot rektangel kollisjonssjekk
export function rectangleCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

// Sirkel mot sirkel kollisjonssjekk
export function circleCollision(circle1, circle2) {
  const dx = circle1.x - circle2.x;
  const dy = circle1.y - circle2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  return distance < circle1.radius + circle2.radius;
}

// Rektangel mot sirkel kollisjonssjekk
export function rectangleCircleCollision(rect, circle) {
  // Finn nærmeste punkt på rektangelet til sirkelmidtpunktet
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
  
  // Beregn avstanden fra det nærmeste punktet til sirkelmidtpunktet
  const distanceX = circle.x - closestX;
  const distanceY = circle.y - closestY;
  const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
  
  // Sjekk om avstanden er mindre enn sirkelens radius
  return distanceSquared < (circle.radius * circle.radius);
}

// Punkt i rektangel
export function pointInRectangle(point, rect) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

// Punkt i sirkel
export function pointInCircle(point, circle) {
  const dx = point.x - circle.x;
  const dy = point.y - circle.y;
  const distanceSquared = dx * dx + dy * dy;
  
  return distanceSquared <= circle.radius * circle.radius;
}

// Konverter Phaser-objekt til kollisjonsobjekt
export function toCollisionRect(obj) {
  return {
    x: obj.x,
    y: obj.y,
    width: obj.width || obj.displayWidth,
    height: obj.height || obj.displayHeight
  };
}

// Konverter Phaser-objekt til kollisjonssirkel
export function toCollisionCircle(obj) {
  const width = obj.width || obj.displayWidth;
  const height = obj.height || obj.displayHeight;
  
  return {
    x: obj.x + width / 2,
    y: obj.y + height / 2,
    radius: Math.max(width, height) / 2
  };
}

// Phaser-spesifikk kollisjonssjekk for Game Objects
export function phaserObjectsCollide(obj1, obj2, useCircles = false) {
  if (!obj1.active || !obj2.active) {
    return false;
  }
  
  if (useCircles) {
    const circle1 = toCollisionCircle(obj1);
    const circle2 = toCollisionCircle(obj2);
    return circleCollision(circle1, circle2);
  } else {
    const rect1 = toCollisionRect(obj1);
    const rect2 = toCollisionRect(obj2);
    return rectangleCollision(rect1, rect2);
  }
}

// Sjekk kollisjon mellom en gruppe og et objekt
export function groupVsObject(group, obj, callback, useCircles = false) {
  if (!group || !obj || !obj.active) return false;
  
  let collision = false;
  
  group.getChildren().forEach(child => {
    if (child.active && phaserObjectsCollide(child, obj, useCircles)) {
      collision = true;
      if (callback) {
        callback(child, obj);
      }
    }
  });
  
  return collision;
}

// Sjekk kollisjon mellom to grupper
export function groupVsGroup(group1, group2, callback, useCircles = false) {
  if (!group1 || !group2) return false;
  
  let collision = false;
  
  group1.getChildren().forEach(child1 => {
    if (!child1.active) return;
    
    group2.getChildren().forEach(child2 => {
      if (!child2.active) return;
      
      if (phaserObjectsCollide(child1, child2, useCircles)) {
        collision = true;
        if (callback) {
          callback(child1, child2);
        }
      }
    });
  });
  
  return collision;
}

// Eksporter samleobjekt for enkel import
export default {
  rectangleCollision,
  circleCollision,
  rectangleCircleCollision,
  pointInRectangle,
  pointInCircle,
  toCollisionRect,
  toCollisionCircle,
  phaserObjectsCollide,
  groupVsObject,
  groupVsGroup
};