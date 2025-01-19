
window.onload = function() {
  // Build a system
  let url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  let options = {
  "swaggerDoc": {
    "openapi": "3.0.0",
    "paths": {
      "/blogger/blogs/{blogsId}/posts": {
        "get": {
          "operationId": "BloggersController_getPostsByBlogId",
          "parameters": [
            {
              "name": "blogsId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/blogger/blogs": {
        "get": {
          "operationId": "BloggersController_getAllBlogs",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "post": {
          "operationId": "BloggersController_createNewBlog",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BlogRequest"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          }
        }
      },
      "/blogger/blogs/{blogId}/posts": {
        "post": {
          "operationId": "BloggersController_createPostInBlogByBlogId",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BodyPostToRequest"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          }
        }
      },
      "/blogger/blogs/{blogId}": {
        "put": {
          "operationId": "BloggersController_updateBlogByBlogId",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BlogRequest"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        },
        "delete": {
          "operationId": "BloggersController_deleteBlogById",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/blogger/blogs/{blogId}/posts/{postId}": {
        "put": {
          "operationId": "BloggersController_updatePostInBlogByBlogIdAndPostId",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BodyPostToRequest"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        },
        "delete": {
          "operationId": "BloggersController_deletePostInBlogById",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/posts": {
        "get": {
          "operationId": "PostsController_getAllPostsInDB",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "post": {
          "operationId": "PostsController_createNewPost",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BodyPostToRequest1"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          }
        }
      },
      "/posts/{id}": {
        "get": {
          "operationId": "PostsController_getPostByPostId",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "put": {
          "operationId": "PostsController_updatePostByPostId",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BodyPostToRequest1"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        },
        "delete": {
          "operationId": "PostsController_deletePostByPostId",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/posts/{id}/comments": {
        "get": {
          "operationId": "PostsController_getCommentByCommendIdInPosts",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "post": {
          "operationId": "PostsController_createCommentsInPostById",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ContentClass"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          }
        }
      },
      "/posts/{id}/like-status": {
        "put": {
          "operationId": "PostsController_appropriationLike",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/StatusLikes"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/": {
        "get": {
          "operationId": "AppController_getHello",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/sa/users": {
        "get": {
          "operationId": "UserController_getAllUserInDB",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "post": {
          "operationId": "UserController_createNewUser",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UserBasicRequestBody"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          }
        }
      },
      "/sa/users/{id}": {
        "get": {
          "operationId": "UserController_getUserByCodeIdInDB",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "delete": {
          "operationId": "UserController_deleteUserInDB",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/blogs": {
        "get": {
          "operationId": "BlogsController_getAllBlogs",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/blogs/{id}": {
        "get": {
          "operationId": "BlogsController_getBlogById",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/blogs/{id}/posts": {
        "get": {
          "operationId": "BlogsController_getPostsInBlogById",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/comments/{id}": {
        "get": {
          "operationId": "CommentsController_getCommentsById",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "put": {
          "operationId": "CommentsController_updateCommentByCommentId",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ContentClass"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        },
        "delete": {
          "operationId": "CommentsController_deleteCommentByCommentId",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/comments/{id}/like-status": {
        "put": {
          "operationId": "CommentsController_appropriationLike",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/StatusLikes"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/testing/all-data": {
        "delete": {
          "operationId": "AllDataClearController_allDataClear",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/security/devices": {
        "get": {
          "operationId": "DeviceController_getAllDevice",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "delete": {
          "operationId": "DeviceController_deleteAllDeviceUserExceptCurrent",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/security/devices/{id}": {
        "delete": {
          "operationId": "DeviceController_deleteDeviceUserById",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/sa/blogs": {
        "get": {
          "operationId": "BlogsSQLController_getAllBlogs",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/sa/blogs/{id}/bind-with-user/{userId}": {
        "put": {
          "operationId": "BlogsSQLController_getBlogById",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/pair-game-quiz/users/top": {
        "get": {
          "operationId": "QuizGameController_getTopPlayer",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/pair-game-quiz/pairs/my": {
        "get": {
          "operationId": "QuizGameController_getHistoryPlayer",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/pair-game-quiz/users/my-statistic": {
        "get": {
          "operationId": "QuizGameController_getStatisticPlayer",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/pair-game-quiz/pairs/my-current": {
        "get": {
          "operationId": "QuizGameController_getUnfinishedCurrentGame",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/pair-game-quiz/pairs/{id}": {
        "get": {
          "operationId": "QuizGameController_getGameById",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/pair-game-quiz/pairs/connection": {
        "post": {
          "operationId": "QuizGameController_connectCurrentUser",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/pair-game-quiz/pairs/my-current/answers": {
        "post": {
          "operationId": "QuizGameController_sendAnswer",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/sa/quiz/questions": {
        "get": {
          "operationId": "QuizGameControllerSuperAdmin_getUnfinishedCurrentGame",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "post": {
          "operationId": "QuizGameControllerSuperAdmin_connectCurrentUser",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/requestBodyQuestionToCreate"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          }
        }
      },
      "/sa/quiz/questions/{id}": {
        "delete": {
          "operationId": "QuizGameControllerSuperAdmin_sendAnswer",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          }
        },
        "put": {
          "operationId": "QuizGameControllerSuperAdmin_ChangeBodyQuestionAndAnswer",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/requestBodyQuestionToCreate"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/sa/quiz/questions/{id}/publish": {
        "put": {
          "operationId": "QuizGameControllerSuperAdmin_changePublishedStatusToQuestion",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PublishType"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/auth/login": {
        "post": {
          "operationId": "AuthController_loginInApp",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/auth/refresh-token": {
        "post": {
          "operationId": "AuthController_refreshToken",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/auth/password-recovery": {
        "post": {
          "operationId": "AuthController_passwordRecovery",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "string"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/auth/new-password": {
        "post": {
          "operationId": "AuthController_newPassword",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/auth/registration-confirmation": {
        "post": {
          "operationId": "AuthController_registrationConfirmation",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/auth/registration": {
        "post": {
          "operationId": "AuthController_registration",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UserBasicRequestBody"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/auth/registration-email-resending": {
        "post": {
          "operationId": "AuthController_registrationEmailResending",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/auth/logout": {
        "post": {
          "operationId": "AuthController_logoutInApp",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/auth/me": {
        "get": {
          "operationId": "AuthController_me",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      }
    },
    "info": {
      "title": "api example",
      "description": "The cats API description",
      "version": "1.0",
      "contact": {}
    },
    "tags": [
      {
        "name": "api",
        "description": ""
      }
    ],
    "servers": [],
    "components": {
      "schemas": {
        "BlogRequest": {
          "type": "object",
          "properties": {}
        },
        "BodyPostToRequest": {
          "type": "object",
          "properties": {}
        },
        "ContentClass": {
          "type": "object",
          "properties": {}
        },
        "BodyPostToRequest1": {
          "type": "object",
          "properties": {}
        },
        "StatusLikes": {
          "type": "object",
          "properties": {}
        },
        "UserBasicRequestBody": {
          "type": "object",
          "properties": {}
        },
        "requestBodyQuestionToCreate": {
          "type": "object",
          "properties": {}
        },
        "PublishType": {
          "type": "object",
          "properties": {}
        }
      }
    }
  },
  "customOptions": {}
};
  url = options.swaggerUrl || url
  let urls = options.swaggerUrls
  let customOptions = options.customOptions
  let spec1 = options.swaggerDoc
  let swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (let attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  let ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.initOAuth) {
    ui.initOAuth(customOptions.initOAuth)
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }
  
  window.ui = ui
}
