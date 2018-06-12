/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2016 Photon Storm Ltd.
 * @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
 */

/**
 * Phaser.TilemapParser parses data objects from Phaser.Loader that need more preparation before they can be inserted into a Tilemap.
 *
 * @class Phaser.TilemapParser
 * @static
 */
import {Game} from '../core/Game';
import {Tile} from './Tile';
import {Tilemap} from './Tilemap';

export class TilemapParser {

    /**
     * When scanning the Tiled map data the TilemapParser can either insert a null value (true) or
     * a Phaser.Tile instance with an index of -1 (false, the default). Depending on your game type
     * depends how this should be configured. If you've a large sparsely populated map and the tile
     * data doesn't need to change then setting this value to `true` will help with memory consumption.
     * However if your map is small, or you need to update the tiles (perhaps the map dynamically changes
     * during the game) then leave the default value set.
     *
     * @constant
     * @type {boolean}
     */
    static INSERT_NULL: boolean = false;
    constructor() {
    }

    /**
     * Parse tilemap data from the cache and creates data for a Tilemap object.
     *
     * @method Phaser.TilemapParser.parse
     * @param {Phaser.Game} game - Game reference to the currently running game.
     * @param {string} key - The key of the tilemap in the Cache.
     * @param {number} [tileWidth=32] - The pixel width of a single map tile. If using CSV data you must specify this. Not required if using Tiled map data.
     * @param {number} [tileHeight=32] - The pixel height of a single map tile. If using CSV data you must specify this. Not required if using Tiled map data.
     * @param {number} [width=10] - The width of the map in tiles. If this map is created from Tiled or CSV data you don't need to specify this.
     * @param {number} [height=10] - The height of the map in tiles. If this map is created from Tiled or CSV data you don't need to specify this.
     * @return {object} The parsed map object.
     */
    static parse(game: Game, key: string, tileWidth: number, tileHeight: number, width: number, height: number): object {

        if (tileWidth === undefined) {
            tileWidth = 32;
        }
        if (tileHeight === undefined) {
            tileHeight = 32;
        }
        if (width === undefined) {
            width = 10;
        }
        if (height === undefined) {
            height = 10;
        }

        if (key === undefined) {
            return TilemapParser.getEmptyData();
        }

        if (key === null) {
            return TilemapParser.getEmptyData(tileWidth, tileHeight, width, height);
        }

        let map = game.cache.getTilemapData(key);

        if (map) {
            return TilemapParser.parseTiledJSON(map.data);
        }
        else {
            console.warn('Phaser.TilemapParser.parse - No map data found for key ' + key);
        }

    }

    /**
     * Returns an empty map data object.
     *
     * @method Phaser.TilemapParser.getEmptyData
     * @return {object} Generated map data.
     */
    static getEmptyData(tileWidth?: number, tileHeight?: number, width?: number, height?: number): object {

        return {
            width: (width !== undefined && width !== null) ? width : 0,
            height: (height !== undefined && height !== null) ? height : 0,
            tileWidth: (tileWidth !== undefined && tileWidth !== null) ? tileWidth : 0,
            tileHeight: (tileHeight !== undefined && tileHeight !== null) ? tileHeight : 0,
            orientation: 'orthogonal',
            version: '1',
            properties: {},
            widthInPixels: 0,
            heightInPixels: 0,
            layers: [
                {
                    name: 'layer',
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                    widthInPixels: 0,
                    heightInPixels: 0,
                    alpha: 1,
                    visible: true,
                    properties: {},
                    indexes: [],
                    callbacks: [],
                    bodies: [],
                    data: []
                }
            ],
            images: [],
            objects: {},
            collision: {},
            tilesets: [],
            tiles: []
        };

    }

    static _slice(obj, fields) {
        let sliced = {};

        for (let k in fields) {
            let key = fields[k];

            if (typeof obj[key] !== 'undefined') {
                sliced[key] = obj[key];
            }
        }

        return sliced;
    }

    /**
     * Parses an object group in Tiled JSON files. Object groups can be found in both layers and tilesets. Called internally in parseTiledJSON.
     * @method Phaser.TilemapParser.parseObjectGroup
     * @param {object} objectGroup - A JSON object group.
     * @param {object} objectsCollection - An object into which new array of Tiled map objects will be added.
     * @param {object} collisionCollection - An object into which new array of collision objects will be added. Currently only polylines are added.
     * @param {string} [_nameKey=objectGroup.name] - Key under which to store objects in collisions in objectsCollection and collisionCollection
     * @param {object} [_relativePosition={x: 0, y: 0}] - Coordinates the object group's position is relative to.
     * @return {object} A object literal containing the objectsCollection and collisionCollection
     */
    static parseObjectGroup(objectGroup, objectsCollection, collisionCollection, _nameKey?, _relativePosition?) {

        let nameKey = _nameKey || objectGroup.name;
        let relativePosition = _relativePosition || {x: 0, y: 0};
        let slice = TilemapParser._slice;

        if (!nameKey) {
            console.warn('No name found for objectGroup', objectGroup);
        }

        if (relativePosition.x === undefined || relativePosition.y === undefined) {
            console.warn('Malformed xy properties in relativePosition', relativePosition);
        }

        objectsCollection[nameKey] = objectsCollection[nameKey] || [];
        collisionCollection[nameKey] = collisionCollection[nameKey] || [];

        for (let v = 0, len = objectGroup.objects.length; v < len; v++) {
            let o = objectGroup.objects[v];

            //  Object Tiles
            if (o.gid) {
                let rotation = null;
                if (o.rotation) {
                    rotation = o.rotation;
                }
                let object = {
                    gid: o.gid,
                    name: o.name,
                    type: o.type || '',
                    x: o.x + relativePosition.x,
                    y: o.y + relativePosition.y,
                    width: o.width,
                    height: o.height,
                    visible: o.visible,
                    properties: o.properties,
                    rotation: rotation
                };

                objectsCollection[nameKey].push(object);
            }
            else if (o.polyline) {
                let rotation = null;
                if (o.rotation) {
                    rotation = o.rotation;
                }
                let object = {
                    name: o.name,
                    type: o.type,
                    x: o.x + relativePosition.x,
                    y: o.y + relativePosition.y,
                    width: o.width,
                    height: o.height,
                    visible: o.visible,
                    properties: o.properties,
                    rotation: rotation,
                    polyline: []
                };

                //  Parse the polyline into an array
                for (let p = 0; p < o.polyline.length; p++) {
                    object.polyline.push([o.polyline[p].x, o.polyline[p].y]);
                }

                collisionCollection[nameKey].push(object);
                objectsCollection[nameKey].push(object);
            }

            // polygon
            else if (o.polygon) {
                let object: any = slice(o, ['name', 'type', 'x', 'y', 'visible', 'rotation', 'properties']);

                object.x += relativePosition.x;
                object.y += relativePosition.y;

                //  Parse the polygon into an array
                object.polygon = [];

                for (let p = 0; p < o.polygon.length; p++) {
                    object.polygon.push([o.polygon[p].x, o.polygon[p].y]);
                }

                collisionCollection[nameKey].push(object);
                objectsCollection[nameKey].push(object);
            }

            // ellipse
            else if (o.ellipse) {
                let object: any = slice(o, ['name', 'type', 'ellipse', 'x', 'y', 'width', 'height', 'visible', 'rotation', 'properties']);
                object.x += relativePosition.x;
                object.y += relativePosition.y;

                collisionCollection[nameKey].push(object);
                objectsCollection[nameKey].push(object);
            }

            // otherwise it's a rectangle
            else {
                let object: any = slice(o, ['name', 'type', 'x', 'y', 'width', 'height', 'visible', 'rotation', 'properties']);
                object.x += relativePosition.x;
                object.y += relativePosition.y;

                object.rectangle = true;
                collisionCollection[nameKey].push(object);
                objectsCollection[nameKey].push(object);
            }
        }

        return {
            objectsCollection: objectsCollection,
            collisionCollection: collisionCollection
        };
    }

    /**
     * Parses a Tiled JSON file into valid map data.
     * @method Phaser.TilemapParser.parseTiledJSON
     * @param {object} json - The JSON map data.
     * @return {object} Generated and parsed map data.
     */
    static parseTiledJSON(json) {

        if (json.orientation !== 'orthogonal') {
            console.warn('TilemapParser.parseTiledJSON - Only orthogonal map types are supported in this version of Phaser');
            return null;
        }

        //  Map data will consist of: layers, objects, images, tilesets, sizes
        let map = {
            width: json.width,
            height: json.height,
            tileWidth: json.tilewidth,
            tileHeight: json.tileheight,
            orientation: json.orientation,
            format: Tilemap.TILED_JSON,
            version: json.version,
            properties: json.properties,
            widthInPixels: json.width * json.tilewidth,
            heightInPixels: json.height * json.tileheight,
            layers: [],
            objects: {},
            collision: {},
            tiles: []
        };

        //  Tile Layers
        let layers = [];

        for (let i = 0; i < json.layers.length; i++) {
            if (json.layers[i].type !== 'tilelayer') {
                continue;
            }

            let curl = json.layers[i];

            // Base64 decode data if necessary
            // NOTE: uncompressed base64 only.

            if (!curl.compression && curl.encoding && curl.encoding === 'base64') {
                let binaryString = window.atob(curl.data);
                let len = binaryString.length;
                let bytes = new Array(len);

                // Interpret binaryString as an array of bytes representing
                // little-endian encoded uint32 values.
                for (let j = 0; j < len; j += 4) {
                    bytes[j / 4] = (
                        binaryString.charCodeAt(j) |
                        binaryString.charCodeAt(j + 1) << 8 |
                        binaryString.charCodeAt(j + 2) << 16 |
                        binaryString.charCodeAt(j + 3) << 24
                    ) >>> 0;
                }

                curl.data = bytes;

                delete curl.encoding;
            }
            else if (curl.compression) {
                console.warn('TilemapParser.parseTiledJSON - Layer compression is unsupported, skipping layer \'' + curl.name + '\'');
                continue;
            }

            let layer = {

                name: curl.name,
                x: curl.x,
                y: curl.y,
                width: curl.width,
                height: curl.height,
                widthInPixels: curl.width * json.tilewidth,
                heightInPixels: curl.height * json.tileheight,
                alpha: curl.opacity,
                offsetX: curl.offsetx,
                offsetY: curl.offsety,
                visible: curl.visible,
                properties: {},
                indexes: [],
                callbacks: [],
                bodies: [],
                data: null

            };

            if (curl.properties) {
                layer.properties = curl.properties;
            }

            let x = 0;
            let row = [];
            let output = [];
            let rotation, flipped, flippedVal, gid;

            //  Loop through the data field in the JSON.

            //  This is an array containing the tile indexes, one after the other. -1 = no tile, everything else = the tile index (starting at 1 for Tiled, 0 for CSV)
            //  If the map contains multiple tilesets then the indexes are relative to that which the set starts from.
            //  Need to set which tileset in the cache = which tileset in the JSON, if you do this manually it means you can use the same map data but a new tileset.

            for (let t = 0, len = curl.data.length; t < len; t++) {
                rotation = 0;
                flipped = false;
                gid = curl.data[t];
                flippedVal = 0;

                //  If true the current tile is flipped or rotated (Tiled TMX format)
                if (gid > 0x20000000) {
                    // FlippedX
                    if (gid > 0x80000000) {
                        gid -= 0x80000000;
                        flippedVal += 4;
                    }

                    // FlippedY
                    if (gid > 0x40000000) {
                        gid -= 0x40000000;
                        flippedVal += 2;
                    }

                    // FlippedAD (anti-diagonal = top-right is swapped with bottom-left corners)
                    if (gid > 0x20000000) {
                        gid -= 0x20000000;
                        flippedVal += 1;
                    }

                    switch (flippedVal) {
                        case 5:
                            rotation = Math.PI / 2;
                            break;

                        case 6:
                            rotation = Math.PI;
                            break;

                        case 3:
                            rotation = 3 * Math.PI / 2;
                            break;

                        case 4:
                            rotation = 0;
                            flipped = true;
                            break;

                        case 7:
                            rotation = Math.PI / 2;
                            flipped = true;
                            break;

                        case 2:
                            rotation = Math.PI;
                            flipped = true;
                            break;

                        case 1:
                            rotation = 3 * Math.PI / 2;
                            flipped = true;
                            break;
                    }
                }

                //  index, x, y, width, height
                if (gid > 0) {
                    let tile = new Tile(layer, gid, x, output.length, json.tilewidth, json.tileheight);

                    tile.rotation = rotation;
                    tile.flipped = flipped;

                    row.push(tile);
                }
                else if (TilemapParser.INSERT_NULL) {
                    row.push(null);
                }
                else {
                    row.push(new Tile(layer, -1, x, output.length, json.tilewidth, json.tileheight));
                }

                x++;

                if (x === curl.width) {
                    output.push(row);
                    x = 0;
                    row = [];
                }
            }

            layer.data = output;

            layers.push(layer);
        }

        map.layers = layers;

        //  Images
        // let images = [];
        //
        // for (let i = 0; i < json.layers.length; i++) {
        //     if (json.layers[i].type !== 'imagelayer') {
        //         continue;
        //     }
        //
        //     let curi = json.layers[i];
        //
        //     let image = {
        //
        //         name: curi.name,
        //         image: curi.image,
        //         x: curi.x,
        //         y: curi.y,
        //         alpha: curi.opacity,
        //         visible: curi.visible,
        //         properties: {}
        //
        //     };
        //
        //     if (curi.properties) {
        //         image.properties = curi.properties;
        //     }
        //
        //     images.push(image);
        //
        // }
        //
        // map.images = images;

        //  Tilesets & Image Collections
        // let tilesets = [];
        // let tilesetGroupObjects = {};
        // let imagecollections = [];
        // let lastSet = null;

        // for (let i = 0; i < json.tilesets.length; i++) {
        //     //  name, firstgid, width, height, margin, spacing, properties
        //     let set = json.tilesets[i];
        //
        //     if (set.source) {
        //         console.warn('Phaser.TilemapParser - Phaser can\'t load external tilesets (%s). Use the Embed Tileset button and then export the map again.', set.source);
        //     }
        //
        //     // build a temporary object for objectgroups found in the tileset's tiles
        //     for (let ti in set.tiles) {
        //         let objectGroup = set.tiles[ti].objectgroup;
        //
        //         if (!objectGroup) {
        //             continue;
        //         }
        //
        //         tilesetGroupObjects[parseInt(ti, 10) + set.firstgid] = objectGroup;
        //     }
        //
        //     //  We've got a new Tileset, so set the lastgid into the previous one
        //     if (lastSet) {
        //         lastSet.lastgid = set.firstgid - 1;
        //     }
        //
        //     lastSet = set;
        // }

        // map.tilesets = tilesets;
        // map.imagecollections = imagecollections;

        //  Objects & Collision Data (polylines, etc)
        let objects = {};
        let collision = {};

        for (let i = 0; i < json.layers.length; i++) {
            if (json.layers[i].type !== 'objectgroup') {
                continue;
            }

            let objectGroup = json.layers[i];
            TilemapParser.parseObjectGroup(objectGroup, objects, collision);
        }

        map.objects = objects;
        map.collision = collision;

        map.tiles = [];

        //  Finally lets build our super tileset index
        // for (let i = 0; i < map.tilesets.length; i++) {
        //     let set = map.tilesets[i];
        //
        //     let x = set.tileMargin;
        //     let y = set.tileMargin;
        //
        //     let count = 0;
        //     let countX = 0;
        //     let countY = 0;
        //
        //     for (let t = set.firstgid; t < set.firstgid + set.total; t++) {
        //         //  Can add extra properties here as needed
        //         map.tiles[t] = [x, y, i];
        //
        //         x += set.tileWidth + set.tileSpacing;
        //
        //         count++;
        //
        //         if (count === set.total) {
        //             break;
        //         }
        //
        //         countX++;
        //
        //         if (countX === set.columns) {
        //             x = set.tileMargin;
        //             y += set.tileHeight + set.tileSpacing;
        //
        //             countX = 0;
        //             countY++;
        //
        //             if (countY === set.rows) {
        //                 break;
        //             }
        //         }
        //     }
        //
        // }

        // assign tile properties

        let layer;
        let tile;
        let sid;
        let set;

        // go through each of the map data layers
        for (let i = 0; i < map.layers.length; i++) {
            layer = map.layers[i];
            collision[layer.name] = [];
            set = null;

            // rows of tiles
            for (let j = 0; j < layer.data.length; j++) {
                let row = layer.data[j];

                // individual tiles
                for (let k = 0; k < row.length; k++) {
                    tile = row[k];

                    if (tile === null || tile.index < 0) {
                        continue;
                    }

                    // find the relevant tileset

                    sid = map.tiles[tile.index][2];
                    // set = map.tilesets[sid];


                    // if that tile type has any properties, add them to the tile object

                    if (set.tileProperties && set.tileProperties[tile.index - set.firstgid]) {
                        tile.properties = Utils.mixin(set.tileProperties[tile.index - set.firstgid], tile.properties);
                    }

                    let objectGroup = tilesetGroupObjects[tile.index];
                    if (objectGroup) {
                        // build collisions and objects for objectgroups found in the tileset's tiles
                        TilemapParser.parseObjectGroup(
                            objectGroup,
                            map.objects,
                            map.collision,
                            tile.layer.name,
                            {
                                x: tile.worldX + objectGroup.x,
                                y: tile.worldY + objectGroup.y
                            });
                    }

                }
            }
        }

        return map;

    }
}
