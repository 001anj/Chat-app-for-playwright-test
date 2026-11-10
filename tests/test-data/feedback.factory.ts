import { faker } from "@faker-js/faker";

export function buildFeedbackContent() {
  return {
    title: `${faker.lorem.words(3)} ${faker.datatype.uuid()}`,
    body: faker.lorem.sentences(2),
  };
}

export function buildFeedbackPayload(receiverId: number) {
  const { title, body } = buildFeedbackContent();

  return {
    title,
    body,
    receiverId,
  };
}
