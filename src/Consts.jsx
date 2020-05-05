import React from 'react';

export const HOST_ADDR = "http://danielbrav.mymsn.eu/";
export const HREF = window.location.href.match("http://(.*?)/")[0];
export const UPLOAD_HREF = HREF.includes("localhost") ? HOST_ADDR : HREF;
export const IMAGE_HREF = HREF.includes("localhost") ? HOST_ADDR : HREF;
export const PHP_HREF = HREF.includes("localhost") ? HOST_ADDR : HREF;