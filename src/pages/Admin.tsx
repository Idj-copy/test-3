import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Category } from '../types/category';
import { SportEvent } from '../types/event';
import { getCategories, saveCategory, updateCategory, deleteCategory } from '../services/categoryService';
import { saveCustomEvent, getCustomEvents, deleteCustomEvent } from '../services/customEventsService';
import EditCategoryDialog from '../components/EditCategoryDialog';

function Admin() {
  const [selectedTab, setSelectedTab] = useState('events');
  const [categories] = useState<Category[]>(getCategories());
  const [customEvents] = useState<SportEvent[]>(getCustomEvents());
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const [eventForm, setEventForm] = useState({
    title: '',
    sportType: '',
    subcategory: '',
    startTime: '',
    endTime: '',
    venue: '',
    broadcastChannel: '',
    broadcastLogo: '',
    teams: {
      home: '',
      home_logo: '',
      away: '',
      away_logo: ''
    }
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: ''
  });

  const handleSportTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sportType = e.target.value;
    const category = categories.find(cat => cat.name === sportType);
    setSelectedCategory(category || null);
    setEventForm(prev => ({
      ...prev,
      sportType,
      subcategory: '',
    }));
  };

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: SportEvent = {
      ...eventForm,
      id: `custom-${Date.now()}`,
      status: 'upcoming',
      startTime: new Date(eventForm.startTime).toISOString(),
      endTime: new Date(eventForm.endTime).toISOString(),
      league: selectedCategory?.subcategories?.find(sub => sub.id === eventForm.subcategory) 
        ? {
            name: eventForm.subcategory,
            logo: selectedCategory.icon
          }
        : undefined,
      broadcastLogo: eventForm.broadcastLogo
    };
    saveCustomEvent(newEvent);
    setEventForm({
      title: '',
      sportType: '',
      subcategory: '',
      startTime: '',
      endTime: '',
      venue: '',
      broadcastChannel: '',
      broadcastLogo: '',
      teams: {
        home: '',
        home_logo: '',
        away: '',
        away_logo: ''
      }
    });
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveCategory(categoryForm);
    setCategoryForm({ name: '', icon: '' });
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
  };

  const handleSaveEditedCategory = (updatedCategory: Category) => {
    updateCategory(updatedCategory.id, updatedCategory);
    setEditingCategory(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteCustomEvent(eventId);
  };

  const handleDeleteCategory = (categoryId: string) => {
    deleteCategory(categoryId);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="bg-gray-800">
          <TabsTrigger value="events" className="text-gray-300">Events</TabsTrigger>
          <TabsTrigger value="categories" className="text-gray-300">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-6">
          <Card className="bg-gray-800 text-white border-gray-700">
            <CardHeader>
              <CardTitle>Add New Event</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEventSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={eventForm.title}
                    onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-gray-700 border-gray-600"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sport Type</Label>
                  <Select
                    value={eventForm.sportType}
                    onChange={handleSportTypeChange}
                    className="bg-gray-700 border-gray-600"
                    required
                  >
                    <option value="">Select sport type</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </Select>
                </div>

                {selectedCategory?.subcategories && selectedCategory.subcategories.length > 0 && (
                  <div className="space-y-2">
                    <Label>Subcategory</Label>
                    <Select
                      value={eventForm.subcategory}
                      onChange={(e) => setEventForm(prev => ({ ...prev, subcategory: e.target.value }))}
                      className="bg-gray-700 border-gray-600"
                      required
                    >
                      <option value="">Select subcategory</option>
                      {selectedCategory.subcategories.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="datetime-local"
                      value={eventForm.startTime}
                      onChange={(e) => setEventForm(prev => ({ ...prev, startTime: e.target.value }))}
                      className="bg-gray-700 border-gray-600"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="datetime-local"
                      value={eventForm.endTime}
                      onChange={(e) => setEventForm(prev => ({ ...prev, endTime: e.target.value }))}
                      className="bg-gray-700 border-gray-600"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Venue</Label>
                  <Input
                    value={eventForm.venue}
                    onChange={(e) => setEventForm(prev => ({ ...prev, venue: e.target.value }))}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Broadcast Channel</Label>
                    <Input
                      value={eventForm.broadcastChannel}
                      onChange={(e) => setEventForm(prev => ({ ...prev, broadcastChannel: e.target.value }))}
                      className="bg-gray-700 border-gray-600"
                      placeholder="e.g., DAZN, Canal+, BeIN Sports"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Broadcast Logo URL</Label>
                    <Input
                      value={eventForm.broadcastLogo}
                      onChange={(e) => setEventForm(prev => ({ ...prev, broadcastLogo: e.target.value }))}
                      className="bg-gray-700 border-gray-600"
                      placeholder="URL of the broadcaster's logo"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Home Team/Player</Label>
                    <Input
                      value={eventForm.teams.home}
                      onChange={(e) => setEventForm(prev => ({
                        ...prev,
                        teams: { ...prev.teams, home: e.target.value }
                      }))}
                      className="bg-gray-700 border-gray-600"
                      required
                    />
                    <Input
                      placeholder="Home Logo URL"
                      value={eventForm.teams.home_logo}
                      onChange={(e) => setEventForm(prev => ({
                        ...prev,
                        teams: { ...prev.teams, home_logo: e.target.value }
                      }))}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Away Team/Player</Label>
                    <Input
                      value={eventForm.teams.away}
                      onChange={(e) => setEventForm(prev => ({
                        ...prev,
                        teams: { ...prev.teams, away: e.target.value }
                      }))}
                      className="bg-gray-700 border-gray-600"
                      required
                    />
                    <Input
                      placeholder="Away Logo URL"
                      value={eventForm.teams.away_logo}
                      onChange={(e) => setEventForm(prev => ({
                        ...prev,
                        teams: { ...prev.teams, away_logo: e.target.value }
                      }))}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Add Event
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 text-white border-gray-700">
            <CardHeader>
              <CardTitle>Custom Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customEvents.map(event => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-gray-300">{new Date(event.startTime).toLocaleString()}</p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card className="bg-gray-800 text-white border-gray-700">
            <CardHeader>
              <CardTitle>Add New Category</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-gray-700 border-gray-600"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Icon (emoji or URL)</Label>
                  <Input
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                    className="bg-gray-700 border-gray-600"
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Add Category
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 text-white border-gray-700">
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map(category => (
                  <div key={category.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{category.icon}</span>
                      <span className="font-semibold">{category.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleEditCategory(category)}
                        disabled={category.isDefault}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={category.isDefault}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {editingCategory && (
        <EditCategoryDialog
          category={editingCategory}
          onSave={handleSaveEditedCategory}
          onClose={() => setEditingCategory(null)}
        />
      )}
    </div>
  );
}

export default Admin;