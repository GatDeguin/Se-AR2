module.exports={
  "env": {
    "browser": true,
    "node": true,
    "es2021": true,
    "jest": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "globals": {
    "Hands": "readonly",
    "FaceMesh": "readonly",
    "Pose": "readonly",
    "HAND_CONNECTIONS": "readonly",
    "FACEMESH_LEFT_EYE": "readonly",
    "FACEMESH_RIGHT_EYE": "readonly",
    "FACEMESH_LIPS": "readonly",
    "POSE_CONNECTIONS": "readonly",
    "drawConnectors": "readonly"
  },
  "rules": {}
}
