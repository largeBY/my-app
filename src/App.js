import React, { useState } from 'react';
import {Calendar, Modal, Button, Input, List, Popconfirm, Badge, Col, Row} from 'antd';
import moment from 'moment';

const App = () => {
    const [isDateModalVisible, setisDateModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [notes, setNotes] = useState({}); // 用来存储日期和对应的记事项数组
    const [currentNote, setCurrentNote] = useState(''); // 正在编辑的记事项
    const [editingKey, setEditingKey] = useState(null); // 正在编辑的记事项的 key
    const NOTE_LIMIT = 3; // 日记数量上限
    const [calendarMode, setCalendarMode] = useState('month');
    const [yearMonthInput, setYearMonthInput] = useState('');
    const [noteInput, setNoteInput] = useState('');
    // 更新模式
    const handlePanelChange = (value, mode) => {
        console.log(mode);
        setCalendarMode(mode);
    };

    // 处理日期选择
    const handleDateSelect = (value) => {
        console.log(value);
        if (calendarMode === 'month') {

            setSelectedDate(value);
            setisDateModalVisible(true);
        }
    };

    // const handleDateDoubleClick = (value) => {
    //
    // };

    // 处理模态框确认
    const handleOk = () => {
        if (editingKey !== null) {
            // 编辑
            const updatedNotes = notes[selectedDate.format('YYYY-MM-DD')] || [];
            updatedNotes[editingKey] = currentNote;
            setNotes({
                ...notes,
                [selectedDate.format('YYYY-MM-DD')]: updatedNotes,
            });
        } else {
            // 添加
            const newNote = currentNote.trim();
            if (newNote) {
                const dateNotes = notes[selectedDate.format('YYYY-MM-DD')] || [];
                setNotes({
                    ...notes,
                    [selectedDate.format('YYYY-MM-DD')]: [...dateNotes, newNote],
                });
            }
        }
        setCurrentNote('');
        setEditingKey(null);
        setisDateModalVisible(false);
    };

    // 处理模态框取消
    const handleCancel = () => {
        setCurrentNote('');
        setEditingKey(null);
        setisDateModalVisible(false);
    };

    // 处理记事项变化
    const handleNoteChange = (e) => {
        setCurrentNote(e.target.value);
    };

    // 处理记事项编辑
    const handleEdit = (item, index) => {
        setCurrentNote(item);
        setEditingKey(index);
    };

    // 处理记事项删除
    const handleDelete = (index) => {
        const dateNotes = notes[selectedDate.format('YYYY-MM-DD')] || [];
        dateNotes.splice(index, 1);
        setNotes({
            ...notes,
            [selectedDate.format('YYYY-MM-DD')]: dateNotes,
        });
    };

    // 获取选中日期Notes
    const getDateNotes = () => {
        return selectedDate ? notes[selectedDate.format('YYYY-MM-DD')] || [] : [];
    };

    // 处理年表添加笔记
    const handleAddNoteToMonth = () => {
        const [year, month] = yearMonthInput.split('-').map(Number);
        const dateKey = moment({ year, month: month - 1, day: 1 }).format('YYYY-MM');
        const updatedNotes = notes[dateKey] || [];
        updatedNotes.push(noteInput);
        setNotes({
            ...notes,
            [dateKey]: updatedNotes
        });
        setYearMonthInput('');
        setNoteInput('');
    };

    const dateCellRender = (value) => {
        const formattedDate = value.format('YYYY-MM-DD');
        const dateNotes = notes[formattedDate] || [];

        return (
            <div>
                {dateNotes.map((note, index) => (
                    <React.Fragment key={index}>
                        <Badge status="success" text={note}/>
                        <br/>
                    </React.Fragment>
                ))}
            </div>
            // <ul className="notes-in-calendar">
            //     {dateNotes.map((note, index) => (
            //         <li key={index}>
            //             <Badge status="success" text={note} />
            //         </li>
            //     ))}
            // </ul>
        );
    };

    const monthCellRender = (value) => {
        const formattedDate = value.format('YYYY-MM');
        const monthNotes = notes[formattedDate] || [];

        return (
            <div>
                {monthNotes.map((note, index) => (
                    <React.Fragment key={index}>
                        <Badge status="success" text={note}/>
                        <br/>
                    </React.Fragment>
                ))}
            </div>
        );
    };

    return (
        <>
            {calendarMode === 'year' && (
                <Row gutter={16}>
                    <Col span={2}>
                        <Input
                            placeholder="YYYY-MM"
                            value={yearMonthInput}
                            onChange={(e) => setYearMonthInput(e.target.value)}
                        />
                    </Col>
                    <Col span={6}>
                        <Input
                            placeholder="Note text"
                            value={noteInput}
                            onChange={(e) => setNoteInput(e.target.value)}
                        />
                    </Col>
                    <Col span={1}>
                        <Button type="primary"
                                onClick={handleAddNoteToMonth}>
                            Add Note
                        </Button>
                    </Col>
                </Row>
            )}
            <Calendar dateCellRender={dateCellRender}
                      monthCellRender={monthCellRender}
                      onSelect={handleDateSelect}
                      onPanelChange={handlePanelChange}/>
            <Modal
                title={`Edit Notes for ${selectedDate ? selectedDate.format('YYYY-MM-DD') : ''}`}
                visible={isDateModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={selectedDate && [
                    <Button key="back" onClick={handleCancel}>
                        Cancel
                    </Button>,
                    <Button key="submit"
                            type="primary"
                            onClick={handleOk}
                            disabled={getDateNotes().length >= NOTE_LIMIT&&editingKey == null}>
                        {editingKey !== null ? 'Update Note' : 'Add Note'}
                    </Button>,
                ]}
            >
                {selectedDate && (
                    <List
                        size="small"
                        header={<div>Notes</div>}
                        footer={
                            <div>
                                <Input.TextArea
                                    rows={2}
                                    value={currentNote}
                                    onChange={handleNoteChange}
                                    placeholder="Type your note here"
                                />
                            </div>
                        }
                        bordered
                        dataSource={getDateNotes()}
                        renderItem={(item, index) => (
                            <List.Item
                                actions={[
                                    <a key="list-edit" onClick={() => handleEdit(item, index)}>
                                        edit
                                    </a>,
                                    <Popconfirm
                                        title="Are you sure delete this note?"
                                        onConfirm={() => handleDelete(index)}
                                    >
                                        <a key="list-delete">delete</a>
                                    </Popconfirm>,
                                ]}
                            >
                                {item}
                            </List.Item>
                        )}
                    />
                )}
            </Modal>
        </>
    );
};

export default App;

        