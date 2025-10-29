import NotifationSoundOne from "../assets/notification-sounds/one.mp3";
import NotifationSoundTwo from "../assets/notification-sounds/two.mp3";
import NotifationSoundThree from "../assets/notification-sounds/three.mp3";

const NotificationSounds = [
  { name: "Default", audioId: 1001, audio: true, src: NotifationSoundOne },
  { name: "Chime", audioId: 1002, audio: true, src: NotifationSoundTwo },
  { name: "Pop", audioId: 1003, audio: true, src: NotifationSoundThree },
  { name: "Slient", audioId: 0, audio: false },
];

export {
  NotifationSoundOne,
  NotifationSoundTwo,
  NotifationSoundThree,
  NotificationSounds,
};
