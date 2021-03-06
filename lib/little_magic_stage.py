# -*- coding: utf-8 -*-

import datetime, os, sys
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sprite

class LittleMagicStage(sprite.Sprite):
    'Little Magic Stage Generator'

    # parameter:
    #
    # option['cg'] : 0
    #
    def __init__(self, option):
        super().__init__(option)
    #  def __init__()

    # generate png image from stage data.
    #
    # parameter:
    #
    # data : stage data
    #
    def generate(self, file, data):
        # create image
        layer = next(iter(data))
        width  = len(data[layer][0]);
        heigth = len(data[layer]);
        image = Image.new('RGBA',
            (self.block['width'] * width, self.block['height'] * heigth),
            (255, 255, 255)
        )

        for l, d in data.items():
            self.set_image(image, d, l)

        # crop row 0, -1, -2
        image = image.crop((
            self.block['width'], 0,
            self.block['width'] * (len(data[layer][0]) - 2),
            self.block['height'] * len(data[layer])
        ))

        # rescale
        scale = self.option['scale']
        width, height = image.size
        image = image.resize((int(width * scale), int(height * scale)), Image.NEAREST)

        stage_file = '%s/data/%02i/image/stage/%03i.png' % (self.path['root'], self.option['cg'], file)
        image.save(stage_file, 'png')
    #  def generate()

    # set PIL Image on layer.
    #
    # parameters:
    #
    # image : PIL Image
    # data  : 2D array of sprite data
    # layer : layer name
    #
    def set_image(self, image, data, layer):
        for row in range(len(data)):
            if not isinstance(data[row], list): continue
            for col in range(len(data[row])):
                if not data[row][col]: continue

                width, height = self.block['width'] * col, self.block['height'] * row
                size = (width, height)

                sprite = self.image_data[data[row][col]]
                image.paste(sprite, size, sprite)
            #  for
        #  for
    #  def set_image()
#  class LittleMagicStage

if __name__ == '__main__':
    pass
