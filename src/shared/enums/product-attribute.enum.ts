export enum AttributeType {
    TEXT = 'text',
    SELECT = 'select',
    MULTISELECT = 'multiselect',
    COLOR = 'color',
    IMAGE = 'image',
}

export const AttributeTypeLabels: Record<AttributeType, string> = {
    [AttributeType.TEXT]: 'Text thường',
    [AttributeType.SELECT]: 'Dropdown chọn 1',
    [AttributeType.MULTISELECT]: 'Chọn nhiều giá trị',
    [AttributeType.COLOR]: 'Màu sắc',
    [AttributeType.IMAGE]: 'Hình ảnh',
};
