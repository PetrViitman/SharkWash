<script setup>
	import TextField from '../TextField.vue'
</script>

<template>
	<div class="body">
		<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" version="1.1" x="0" y="0" viewBox="0 0 300 300" xml:space="preserve" style="transform: scale(2);"><g class="svg-group enable-pointer-events"><g id="buy1-idle"><linearGradient id="SVGID_00000018917514385081400190000014233472865120443070_" x1="151.979" x2="147.889" y1="2406.465" y2="2566.673" gradientTransform="translate(0 -2334)" gradientUnits="userSpaceOnUse"><stop offset="0.162" stop-color="#474747"></stop><stop offset="0.467" stop-color="#383838"></stop><stop offset="0.533" stop-color="#303030"></stop><stop offset="0.715" stop-color="#1F1F1F"></stop><stop offset="0.85" stop-color="#191919"></stop></linearGradient><rect y="117.5" width="153" height="65" rx="32.5" ry="32.5" class="bf-out-rect"
			fill="url(#SVGID_00000018917514385081400190000014233472865120443070_)" x="73.5"></rect><linearGradient id="SVGID_00000048496014119142423940000007285476328273322148_" x1="153.005" x2="147.264" y1="-2258.757" y2="-2112.497" gradientTransform="matrix(1 0 0 -1 0 -2032.2)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#424242"></stop><stop offset="0.248" stop-color="#434343"></stop><stop offset="0.674" stop-color="#161616"></stop><stop offset="0.927"></stop></linearGradient><rect y="120.5" width="147" height="59" rx="32.5" ry="32.5" class="bf-in-rect"
			fill="url(#SVGID_00000048496014119142423940000007285476328273322148_)" x="76.5"></rect></g><g class="bf-buy-text-wrapper" style="transform: translate(139px, 161px) scale(0.5);"><g x="0" y="0">
			<path fill="currentColor"  id="buy-cart" transform="translate(-135 -175)" d="M53.8 126.7c0 1.3 1 2.3 2.3 2.3h8.7l5.9 30.5c.2 1.1 1.2 1.9 2.3 1.9h28.7c1 0 2-.7 2.2-1.7l5.7-20.5c.5-2-1.3-3-2.2-3H71.1l-1.9-10.1c-.2-1.1-1.2-1.9-2.3-1.9H56.1c-1.2.2-2.3 1.2-2.3 2.5zM71.6 172.3c0 3.8 3.1 7 6.8 7 3.8 0 6.8-3.1 6.8-7s-3.1-7-6.8-7-6.8 3.2-6.8 7zM89.7 172.3c0 3.8 3.1 7 6.8 7s6.8-3.1 6.8-7-3.1-7-6.8-7-6.8 3.2-6.8 7z"></path></g><g x="0" y="0" transform="translate(0 0)">
			</g>
			</g>
			</g>
	 	</svg>
		<TextField
			class="text-field"
			:layoutX="'center'"
			:layoutY="'middle'"
			:maximalWidth = 45
			:maximalHeight = 50>
		  <slot></slot>
		</TextField>
	</div>
</template>

<style scoped>
	.body{
		width: 100px;
		height: 50px;
		overflow: hidden;
	}
	.svg-icon {
		position: absolute;
		top: -25px;
	}
	.body:hover {
		color: white;
		cursor: pointer;
	}
	.text-field {
		position: absolute;
		left: 40px;
	}
</style>